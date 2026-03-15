const Pdf = require("../models/pdf");

const { addPdfChunks, loadChunks } =
require("../services/chunkCacheService");

const {
extractTextFromPDF,
splitIntoChunks
} = require("../services/pdfService");

const {
extractTextFromScannedPDF
} = require("../services/ocrService");

const {
getEmbedding
} = require("../services/embeddingService");

const fs = require("fs");



/*
-----------------------------------------
UPLOAD PDF
-----------------------------------------
*/

const uploadPdf = async (req,res)=>{

try{

// STEP 1 — Extract normal PDF text

let text =
await extractTextFromPDF(req.file.path);

// If no text → scanned PDF
if(!text || text.trim().length < 50){

console.log("Scanned PDF detected → running OCR");

text =
await extractTextFromScannedPDF(
req.file.path
);

}


// STEP 2 — If no text, run OCR

if(!text || text.trim().length < 50){

console.log("No text detected. Running OCR...");

text =
await extractTextFromScannedPDF(
req.file.path
);

}


// STEP 3 — Split into chunks

const textChunks =
splitIntoChunks(text);


// STEP 4 — Generate embeddings

let chunks = [];

for(let chunkText of textChunks){

const embedding =
await getEmbedding(chunkText);

if(chunkText.trim().length < 100){
continue;
}

chunks.push({

text: chunkText,
embedding: embedding

});

}


// STEP 5 — Save PDF in DB

const pdf = new Pdf({

userId: req.userId,

fileName:
req.file.originalname,

filePath:
req.file.path,

extractedText: text,

chunks: chunks

});


await pdf.save();


// STEP 6 — Update memory cache

addPdfChunks(req.userId, chunks);


// Reload cache for safety
await loadChunks();


// RESPONSE

res.json({

message:
"PDF Uploaded + Vectorized",

pdf: pdf

});


}catch(error){

console.log(error);

res.status(500).json({

message:"Upload Failed"

});

}

};




/*
-----------------------------------------
GET ALL USER PDFs
-----------------------------------------
*/

const getAllPdfs =
async (req,res)=>{

try{

const pdfs =
await Pdf.find({

userId:req.userId

});


res.json(pdfs);

}catch(error){

console.log(error);

res.status(500).json({

message:"Fetch Failed"

});

}

};




/*
-----------------------------------------
DELETE PDF
-----------------------------------------
*/

const deletePdf =
async (req,res)=>{

try{

const pdf =
await Pdf.findOne({

_id:req.params.id,

userId:req.userId

});

if(!pdf){

return res.status(404).json({

message:"PDF Not Found"

});

}


// Delete file from disk

if(fs.existsSync(pdf.filePath)){

fs.unlinkSync(pdf.filePath);

}


// Delete from DB

await Pdf.findOneAndDelete({

_id:req.params.id,

userId:req.userId

});


// Reload chunk cache

await loadChunks();


res.json({

message:
"PDF Deleted Successfully"

});


}catch(error){

console.log(error);

res.status(500).json({

message:"Delete Failed"

});

}

};




module.exports = {

uploadPdf,
getAllPdfs,
deletePdf

};