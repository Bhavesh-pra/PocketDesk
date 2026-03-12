const { extractTextFromPDF, splitIntoChunks } =
require("../services/pdfService");

const { getEmbedding } =
require("../services/embeddingService");

const { addPdfChunks } =
require("../services/chunkCacheService");

const fs = require("fs");

const chatPdf = async (req,res)=>{

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
text:chunkText,
embedding
});

}

addPdfChunks(req.userId, chunks);

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