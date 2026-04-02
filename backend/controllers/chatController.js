const { askAI } = require("../services/aiService");
const { semanticSearch } = require("../services/searchService");
const { rerankChunks } = require("../services/rerankService");
const Conversation = require("../models/conversation");

// =============================
// ASK QUESTION
// =============================
const askQuestion = async (req, res) => {
  try {
    const { question, sessionId } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question required" });
    }

    // =============================
    // 1. SEARCH + RERANK
    // =============================
    const candidates = await semanticSearch(question, req.userId, 20);
    const topChunks = await rerankChunks(question, candidates);

    // =============================
    // 2. DOCUMENT CONTEXT
    // =============================
    let documentContext = "";

    if (topChunks.length > 0) {
      documentContext = topChunks
        .map((c, i) => `
Source ${i + 1}
Type: ${c.sourceType || "document"}
Name: ${c.sourceName || "unknown"}

Content:
${c.text}
`)
        .join("\n\n")
        .substring(0, 8000);
    } else {
      documentContext = `
No highly relevant documents found.
Use general knowledge if needed.
`;
    }

    // =============================
    // 3. LOAD CONVERSATION (ONLY ONCE)
    // =============================
    let conversation = null;
    let historyText = "";
    let pdfContext = "";

    if (sessionId) {
      conversation = await Conversation.findOne({
        sessionId,
        userId: req.userId
      });

      if (conversation) {
        // Chat history
        historyText = conversation.messages
          .slice(-6)
          .map(m => `${m.role}: ${m.content}`)
          .join("\n");

        // PDF context (safe check)
        if (conversation.lastPdfChunks && conversation.lastPdfChunks.length > 0) {
          pdfContext = conversation.lastPdfChunks
            .slice(0, 5)
            .map(c => c.text)
            .join("\n\n");
        }
      }
    }

    // =============================
    // 4. FINAL CONTEXT
    // =============================
    const finalContext = `
Use the following information to answer the user's question.

Previous Conversation:
${historyText}

Recent Uploaded Document:
${pdfContext}

Relevant Document Context:
${documentContext}
`;

    // =============================
    // 5. AI CALL
    // =============================
    const isStream = req.query.stream !== "false";
    const aiResponse = await askAI(finalContext, question, isStream);

    // =============================
    // 6. NON-STREAM MODE
    // =============================
    if (!isStream) {
      return res.json({ answer: aiResponse });
    }

    // =============================
    // 7. STREAM MODE
    // =============================
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    if (res.flushHeaders) res.flushHeaders();

    let fullAnswer = "";

    for await (const chunk of aiResponse) {
      const token =
        chunk?.choices?.[0]?.delta?.content ||
        chunk?.choices?.[0]?.message?.content ||
        "";

      if (token) {
        fullAnswer += token;
        res.write(token);
      }
    }

    // Fallback if empty
    if (!fullAnswer || fullAnswer.trim().length < 5) {
      const fallback =
        "Sorry, I couldn't generate a proper answer. Please try rephrasing.";

      fullAnswer = fallback;
      res.write(fallback);
    }

    res.end();

    // =============================
    // 8. SAVE CONVERSATION
    // =============================
    if (sessionId) {
      if (!conversation) {
        conversation = new Conversation({
          userId: req.userId,
          sessionId,
          messages: []
        });
      }

      conversation.messages.push(
        { role: "User", content: question },
        { role: "AI", content: fullAnswer }
      );

      conversation.updatedAt = new Date();

      await conversation.save();
    }

  } catch (err) {
    console.error("ASK QUESTION ERROR:", err);

    res.status(500).json({
      message: "AI Error"
    });
  }
};

// =============================
// GET CONVERSATION HISTORY
// =============================
const getConversationHistory = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      sessionId: req.params.sessionId,
      userId: req.userId
    });

    if (!conversation) {
      return res.json([]);
    }

    res.json(conversation.messages);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "History fetch error"
    });
  }
};

// =============================
// DELETE CHAT
// =============================
const deleteChat = async (req, res) => {
  try {
    await Conversation.deleteOne({
      sessionId: req.params.sessionId,
      userId: req.userId
    });

    res.json({ message: "Chat deleted" });

  } catch (err) {
    res.status(500).json({
      message: "Delete failed"
    });
  }
};

// =============================
// GET CHAT LIST
// =============================
const getChatList = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      userId: req.userId
    }).sort({ updatedAt: -1 });

    const formatted = conversations.map(c => ({
      sessionId: c.sessionId,
      title:
        c.messages?.find(m => m.role === "User")?.content?.substring(0, 40)
        || "New Chat"
    }));

    res.json(formatted);

  } catch (err) {
    res.status(500).json({
      message: "Chat list error"
    });
  }
};

// =============================
// EXPORTS
// =============================
module.exports = {
  askQuestion,
  getConversationHistory,
  getChatList,
  deleteChat
};