const Pdf = require("../models/pdf");
const Image = require("../models/image");
const Video = require("../models/video");

let chunkCache = {};


// Load chunks grouped by user
const loadChunks = async () => {

const pdfs = await Pdf.find();
const images = await Image.find();
const videos = await Video.find();

chunkCache = {};

pdfs.forEach(pdf => {

const userId = pdf.userId.toString();

if(!chunkCache[userId]){
chunkCache[userId] = [];
}

if(pdf.chunks){
chunkCache[userId] = chunkCache[userId].concat(pdf.chunks);
}

});

images.forEach(img => {

const userId = img.userId.toString();

if(!chunkCache[userId]){
chunkCache[userId] = [];
}

if(img.chunks){
chunkCache[userId] =
chunkCache[userId].concat(img.chunks);
}

});

// Load video transcript chunks on startup
videos.forEach(video => {

const userId = video.userId.toString();

if(!chunkCache[userId]){
chunkCache[userId] = [];
}

if(video.chunks){
chunkCache[userId] =
chunkCache[userId].concat(video.chunks);
}

});

console.log(
"Chunk cache loaded for users:",
Object.keys(chunkCache).length
);

};


// Get chunks for specific user
const getUserChunks = (userId) => {

return chunkCache[userId] || [];

};


// NEW FUNCTION — add chunks instantly after upload
const addPdfChunks = (userId, chunks) => {

userId = userId.toString();

if(!chunkCache[userId]){
chunkCache[userId] = [];
}

chunkCache[userId] = chunkCache[userId].concat(chunks);

};


// NEW FUNCTION — add image chunks instantly after upload
const addImageChunks = (userId, chunks) => {

userId = userId.toString();

if(!chunkCache[userId]){
chunkCache[userId] = [];
}

chunkCache[userId] = chunkCache[userId].concat(chunks);

};


module.exports = {

loadChunks,
getUserChunks,
addPdfChunks,
addImageChunks,
};