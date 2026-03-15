const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads/pdfs/");
    },

    filename: function(req, file, cb) {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({

    storage: storage,

    limits: {
        fileSize: 100 * 1024 * 1024   // 100 MB
    }

});


const extractTextFromPDF = async (filePath) => {

const dataBuffer = fs.readFileSync(filePath);

const data = await pdfParse(dataBuffer);

if(data.text.trim().length > 50){
return data.text;
}

return null;

};

const splitIntoChunks = (text) => {

const chunkSize = 800;
const overlap = 200;

let chunks = [];

for(let i=0;i<text.length;i += (chunkSize - overlap)){

const chunk =
text.substring(i, i + chunkSize);

if(chunk.trim().length > 100){
chunks.push(chunk);
}

}

return chunks;

};


module.exports = {
    upload,
    extractTextFromPDF,
    splitIntoChunks,
};