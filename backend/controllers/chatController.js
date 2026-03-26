const { askAI } = require("../services/aiService");
const { semanticSearch } = require("../services/searchService");
const Conversation = require("../models/conversation");
const { rerankChunks } = require("../services/rerankService");

// =============================
// ASK QUESTION
// =============================
const askQuestion = async (req, res) => {

try {

const question = req.body?.question;
const sessionId = req.body?.sessionId;

if (!question) {
return res.status(400).json({
message: "Question required"
});
}


// =============================
// 1. Semantic Search
// =============================

// STEP 1 — Retrieve more candidates
const candidates =
await semanticSearch(question, req.userId, 20);

const topChunks =
await rerankChunks(question, candidates);

// =============================
// 2. Context Creation
// =============================

let context = "";

if (topChunks.length > 0) {

  context = topChunks
    .map((c, i) => `
Source ${i + 1}
Type: ${c.sourceType || "document"}
Name: ${c.sourceName || "unknown"}

Content:
${c.text}
`)
    .join("\n\n")
    .substring(0, 2000);

} else {

  context = `
No highly relevant documents were found.

Try answering using general knowledge OR previous conversation if helpful.
`;

}


// =============================
// 3. Load Conversation Memory
// =============================

let historyText = "";

let pdfContext = "";

if (sessionId) {
  const conversation = await Conversation.findOne({
    sessionId,
    userId: req.userId
  });

  if (conversation?.lastPdfChunks) {
    pdfContext = conversation.lastPdfChunks
      .slice(0, 5)
      .map(c => c.text)
      .join("\n\n");
  }
}

if (sessionId) {

let conversation = await Conversation.findOne({
sessionId,
userId: req.userId
});

if (conversation) {

historyText = conversation.messages
.slice(-6)
.map(m => `${m.role}: ${m.content}`)
.join("\n");

}

}


// =============================
// 4. Merge Context
// =============================

const finalContext = `
Use the following information to answer the user's question.

Previous Conversation:
${historyText}

Recent Uploaded Document:
${pdfContext}

Relevant Document Context:
${context}
`;

// =============================
// 5. OpenAI Streaming
// =============================

const isStream = req.query.stream !== "false";

const response = await askAI(finalContext, question, isStream);

// ✅ NON-STREAM MODE (for regenerate)
if (!isStream) {
  return res.json({ answer: response });
}

// ✅ STREAM MODE
res.setHeader("Content-Type", "text/plain");
res.setHeader("Transfer-Encoding", "chunked");

res.flushHeaders();  // ✅ AFTER headers

let fullAnswer = "";

for await (const chunk of response) {

  const token = chunk.choices?.[0]?.delta?.content || "";

  if (token) {
    fullAnswer += token;
    res.write(token);
  }

}

// ✅ FIX: send fallback if empty
if (!fullAnswer || fullAnswer.trim().length < 5) {

  const fallback = "Sorry, I couldn't generate a proper answer. Please try rephrasing your question.";

  fullAnswer = fallback;

  res.write(fallback);   // 🔥 VERY IMPORTANT
}

res.end();


// =============================
// 6. Save Conversation
// =============================

if (sessionId) {

let conversation = await Conversation.findOne({
sessionId,
userId: req.userId
});

if (!conversation) {

conversation = new Conversation({
userId: req.userId,
sessionId,
messages: []
});

}

conversation.messages.push({
role: "User",
content: question
});

conversation.messages.push({
role: "AI",
content: fullAnswer
});

conversation.updatedAt = new Date();

await conversation.save();

}

} catch (err) {

console.log(err);

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

res.json({
message: "Chat deleted"
});

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