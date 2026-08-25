const { extractTextWithPython } = require("./pythonPdfService");
const { splitIntoChunks } = require("./pdfService");
const { getEmbedding } = require("./embeddingService");
const Pdf = require("../models/pdf");

const processPdf = async (
  filePath,
  userId,
  fileName
) => {
  const result = await extractTextWithPython(filePath);
  const text = result.text;

  const chunks = splitIntoChunks(text);

  const embeddings = await Promise.all(
    chunks.map(chunk => getEmbedding(chunk))
  );

  const chunkObjects = chunks.map((c, i) => ({
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