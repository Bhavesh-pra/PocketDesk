const Image = require("../models/image");
const { extractTextFromImage } = require("../services/ocrService");
const { splitIntoChunks } = require("../services/pdfService");
const { getEmbedding } = require("../services/embeddingService");
const { addImageChunks, loadChunks } = require("../services/chunkCacheService");

const fs = require("fs");

const deleteImage = async (req,res)=>{

try{

const image = await Image.findOne({

_id:req.params.id,
userId:req.userId

});

if(!image){

return res.status(404).json({
message:"Image not found"
});

}


// delete file from disk
if(fs.existsSync(image.filePath)){

fs.unlinkSync(image.filePath);

}


// delete from database
await Image.deleteOne({
_id:req.params.id
});

await loadChunks();

res.json({
message:"Image deleted"
});

}catch(err){

console.log(err);

res.status(500).json({
message:"Delete failed"
});

}

};

const uploadImage = async (req,res)=>{

    console.log("FILE:", req.file);
console.log("BODY:", req.body);


try{

const text = await extractTextFromImage(req.file.path);

const textChunks = splitIntoChunks(text);

let chunks = [];

for(let chunkText of textChunks){

const embedding = await getEmbedding(chunkText);

chunks.push({
  text: chunkText,
  embedding: embedding,
  sourceType: "image",
  sourceName: req.file.originalname
});

}

const image = new Image({

userId: req.userId,

albumId: req.params.albumId,

fileName: req.file.originalname,

filePath: req.file.path,

extractedText: text,

chunks: chunks

});

await image.save();

// FIX: add to in-memory chunk cache so images are immediately searchable
addImageChunks(req.userId, chunks);

res.json({
message:"Image uploaded + vectorized",
image
});

}catch(err){

console.log(err);

res.status(500).json({
message:"Image upload failed"
});

}

};


const getImages = async (req,res)=>{

try{

const albumId = req.params.albumId;

const images = await Image.find({
albumId,
userId:req.userId
});

res.json(images);

}catch(err){

console.log(err);

res.status(500).json({
message:"Failed to load images"
});

}

};


module.exports={
uploadImage,
getImages,
deleteImage
};