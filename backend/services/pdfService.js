const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/x-pdf"
];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== ".pdf" || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            return cb(new Error("Only PDF files are allowed"), false);
        }
        cb(null, true);
    }
});


const extractTextFromPDF = async (filePath) => {

const dataBuffer = fs.readFileSync(filePath);

const data = await pdfParse(dataBuffer);

// DEBUG LOGS
console.log("----- PDF PARSE DEBUG -----");
console.log("Extracted text length:", data.text.length);
console.log("Sample text:", data.text.substring(0,200));
console.log("---------------------------");

if(data.text.trim().length > 50){
return data.text;
}

return null;

};

const splitIntoChunks = (text) => {

  const chunkSize = 1200;
  const overlap = 250;

  const paragraphs = text.split(/\n+/);

  const chunks = [];
  let currentChunk = "";

  for (const para of paragraphs) {

    if ((currentChunk + para).length < chunkSize) {

      currentChunk += para + "\n";

    } else {

      chunks.push(currentChunk.trim());

      currentChunk =
        currentChunk.slice(-overlap) + para + "\n";

    }

  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;

};


module.exports = {
    upload,
    extractTextFromPDF,
    splitIntoChunks,
};
