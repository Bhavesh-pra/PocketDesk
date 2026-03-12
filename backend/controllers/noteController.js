const fs = require("fs");
const Note = require("../models/note");

const { splitIntoChunks } =
require("../services/pdfService");

const { getEmbedding } =
require("../services/embeddingService");

const { addPdfChunks } =
require("../services/chunkCacheService");


const uploadNote = async (req,res)=>{

try{

const file = req.file;

const text =
fs.readFileSync(file.path,"utf8");

const textChunks =
splitIntoChunks(text);

let chunks = [];

for(const chunkText of textChunks){

const embedding =
await getEmbedding(chunkText);

chunks.push({

text: chunkText,
embedding,
sourceType:"note",
sourceName:file.originalname

});

}

addPdfChunks(req.userId,chunks);

const note = new Note({

userId:req.userId,
fileName:file.originalname,
filePath:file.path,
text

});

await note.save();

res.json({
message:"Note uploaded"
});

}catch(err){

console.log(err);

res.status(500).json({
message:"Note upload failed"
});

}

};

module.exports = { uploadNote };