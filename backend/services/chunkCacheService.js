const Pdf = require("../models/pdf");

let chunkCache = {};


// Load chunks grouped by user
const loadChunks = async () => {

const pdfs = await Pdf.find();

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

console.log(
"Users Loaded:",
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


module.exports = {

loadChunks,
getUserChunks,
addPdfChunks

};