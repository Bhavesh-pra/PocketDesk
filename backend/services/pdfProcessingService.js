const { extractTextFromPDF } =
require("./pdfService");

const { extractTextFromScannedPDF } =
require("./ocrService");

const { splitIntoChunks } =
require("./pdfService");

const { getEmbedding } =
require("./embeddingService");

const Pdf = require("../models/pdf");

const processPdf = async (
filePath,
userId,
fileName
) => {

let text = await extractTextFromPDF(filePath);

if(!text || text.length < 50){

text = await extractTextFromScannedPDF(filePath);

}

const chunks = splitIntoChunks(text);

const embeddings = await Promise.all(
chunks.map(chunk => getEmbedding(chunk))
);

const chunkObjects = chunks.map((c,i)=>({
text: c,
embedding: embeddings[i]
}));

const pdf = new Pdf({
userId,
fileName,
filePath,
extractedText: text,
chunks: chunkObjects
});

await pdf.save();

};

module.exports = { processPdf };