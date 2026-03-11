const { askAI } = require("../services/aiService");
const { semanticSearch } = require("../services/searchService");
const Conversation = require("../models/conversation");


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

const topChunks = await semanticSearch(
question,
req.userId,
3
);


// =============================
// 2. Context Creation
// =============================

let context = "";

if (topChunks.length > 0) {

context = topChunks
.map((c, i) => `Document Section ${i + 1}:\n${c.text}`)
.join("\n\n")
.substring(0, 2000);

}


// =============================
// 3. Load Conversation Memory
// =============================

let historyText = "";

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

Relevant Document Context:
${context}
`;


// =============================
// 5. OpenAI Streaming
// =============================

const stream = await askAI(finalContext, question, true);

res.setHeader("Content-Type", "text/plain");
res.setHeader("Transfer-Encoding", "chunked");
res.flushHeaders();

let fullAnswer = "";

for await (const chunk of stream) {

const token = chunk.choices?.[0]?.delta?.content || "";

if (token) {

fullAnswer += token;
res.write(token);

}

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