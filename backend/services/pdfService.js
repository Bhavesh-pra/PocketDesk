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

    const chunkSize = 800;  // characters per chunk

    let chunks = [];

    for(let i = 0; i < text.length; i += chunkSize){

        chunks.push(text.substring(i, i + chunkSize));

    }

    return chunks;

};


module.exports = {
    upload,
    extractTextFromPDF,
    splitIntoChunks,
};