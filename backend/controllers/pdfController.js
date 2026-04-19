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

const errorResponse = (res, status, message) => {
  return res.status(status).json({ error: message });
};

const uploadPdf = async (req, res) => {

  try {

    if (!req.file) {
      return errorResponse(res, 400, "No file uploaded");
    }

    let text = await extractTextFromPDF(req.file.path);

    if (!text || text.trim().length < 50) {
      text = await extractTextFromScannedPDF(req.file.path);
    }

    if (!text || text.trim().length < 50) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return errorResponse(res, 400, "Could not extract text from PDF");
    }

    const textChunks = splitIntoChunks(text);

    const embeddings = await Promise.all(
      textChunks.map(chunk => getEmbedding(chunk))
    );

    const chunks = textChunks
    .map((chunkText, i) => ({
    text: chunkText,
    embedding: embeddings[i],
    sourceType: "pdf",
    sourceName: req.file.originalname
  }))
      .filter(chunk =>
  chunk.text.trim().length > 100 &&
  chunk.embedding &&
  chunk.embedding.length > 0
);

    const pdf = new Pdf({
      userId: req.userId,
      fileName: req.file.originalname,
      filePath: req.file.path.replace(/\\/g, "/"),
      extractedText: text,
      chunks: chunks,
      size: req.file.size
    });

    await pdf.save();
    addPdfChunks(req.userId, chunks);

    res.status(201).json({
      message: "Document processed successfully",
      pdf: pdf
    });

  } catch (error) {
    console.error("PDF Upload Error:", error);
    errorResponse(res, 500, "Upload failed");
  }

};

const getAllPdfs = async (req, res) => {

  try {

    const pdfs = await Pdf.find({
      userId: req.userId
    });

    res.json(pdfs);

  } catch (error) {
    console.error(error);
    errorResponse(res, 500, "Fetch failed");
  }

};

const deletePdf = async (req, res) => {

  try {

    const pdf = await Pdf.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!pdf) {
      return errorResponse(res, 404, "PDF not found");
    }

    if (fs.existsSync(pdf.filePath)) {
      fs.unlinkSync(pdf.filePath);
    }

    await Pdf.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    await loadChunks();

    res.json({
      message: "PDF deleted successfully"
    });

  } catch (error) {
    console.error(error);
    errorResponse(res, 500, "Delete failed");
  }

};

module.exports = {
  uploadPdf,
  getAllPdfs,
  deletePdf
};