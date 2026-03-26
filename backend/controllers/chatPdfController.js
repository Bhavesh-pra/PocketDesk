const { extractTextFromPDF, splitIntoChunks } =
require("../services/pdfService");

const { getEmbedding } =
require("../services/embeddingService");

const { addPdfChunks } =
require("../services/chunkCacheService");

const fs = require("fs");

const chatPdf = async (req,res)=>{
const sessionId = req.body.sessionId;
try{

const text =
await extractTextFromPDF(req.file.path);

const textChunks =
splitIntoChunks(text);

let chunks = [];

for(const chunkText of textChunks){

const embedding =
await getEmbedding(chunkText);

chunks.push({
  text: chunkText,
  embedding,
  sourceType: "pdf",
  sourceName: req.file.originalname
});

}

addPdfChunks(req.userId, chunks);

const Conversation = require("../models/conversation");

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

  conversation.lastPdfChunks = chunks;
  await conversation.save();
}

res.json({
message:"PDF added to chat knowledge"
});

}catch(err){

console.log(err);

res.status(500).json({
message:"PDF chat upload failed"
});

}

};

module.exports = { chatPdf };