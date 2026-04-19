const { askAI } = require("../services/aiService");
const { semanticSearch } = require("../services/searchService");
const { rerankChunks } = require("../services/rerankService");
const Conversation = require("../models/conversation");

const errorResponse = (res, status, message) => {
  return res.status(status).json({ error: message });
};

const askQuestion = async (req, res) => {
  try {
    const { question, sessionId } = req.body;

    if (!question) {
      return errorResponse(res, 400, "Question required");
    }

    const candidates = await semanticSearch(question, req.userId, 20);
    const topChunks = await rerankChunks(question, candidates);

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

    let conversation = null;
    let historyText = "";
    let pdfContext = "";

    if (sessionId) {
      conversation = await Conversation.findOne({
        sessionId,
        userId: req.userId
      });

      if (conversation) {
        historyText = conversation.messages
          .slice(-6)
          .map(m => `${m.role}: ${m.content}`)
          .join("\n");

        if (conversation.lastPdfChunks && conversation.lastPdfChunks.length > 0) {
          pdfContext = conversation.lastPdfChunks
            .slice(0, 5)
            .map(c => c.text)
            .join("\n\n");
        }
      }
    }

    const finalContext = `
Use the following information to answer the user's question.

Previous Conversation:
${historyText}

Recent Uploaded Document:
${pdfContext}

Relevant Document Context:
${documentContext}
`;

    const isStream = req.query.stream !== "false";
    const aiResponse = await askAI(finalContext, question, isStream);

    if (!isStream) {
      return res.json({ answer: aiResponse });
    }

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

    if (!fullAnswer || fullAnswer.trim().length < 5) {
      const fallback = "Sorry, I couldn't generate a proper answer. Please try rephrasing.";
      fullAnswer = fallback;
      res.write(fallback);
    }

    res.end();

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
    errorResponse(res, 500, "AI Error");
  }
};

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
    console.error("History fetch error:", err);
    errorResponse(res, 500, "History fetch error");
  }
};

const deleteChat = async (req, res) => {
  try {
    await Conversation.deleteOne({
      sessionId: req.params.sessionId,
      userId: req.userId
    });

    res.json({ message: "Chat deleted" });

  } catch (err) {
    console.error("Delete chat error:", err);
    errorResponse(res, 500, "Delete failed");
  }
};

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
    console.error("Chat list error:", err);
    errorResponse(res, 500, "Chat list error");
  }
};

module.exports = {
  askQuestion,
  getConversationHistory,
  getChatList,
  deleteChat
};