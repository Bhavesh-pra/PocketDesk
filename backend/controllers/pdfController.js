const mongoose = require("mongoose");
const Pdf = require("../models/pdf");

const { addPdfChunks, loadChunks } = require("../services/chunkCacheService");
const { extractTextFromPDF, splitIntoChunks } = require("../services/pdfService");
const { extractTextFromScannedPDF } = require("../services/ocrService");
const { getEmbedding } = require("../services/embeddingService");
const {
  uploadObject,
  deleteObject,
  buildObjectKey,
  isR2Configured
} = require("../services/r2StorageService");
const {
  writeBufferToTempFile,
  cleanupTempFile
} = require("../services/tempFileService");

const errorResponse = (res, status, message) => {
  return res.status(status).json({ error: message });
};

const formatPdfUploadError = (error) => {
  if (!error) {
    return "Unknown upload error";
  }

  if (error.code === "CredentialsProviderError") {
    return "R2 credentials are invalid or missing";
  }

  if (error.name === "MongoServerError" || error.name === "ValidationError") {
    return "Database save failed";
  }

  if (error.name === "AxiosError") {
    return "Embedding request failed";
  }

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }

  return "Upload failed";
};

const uploadPdf = async (req, res) => {
  let tempPath;
  let tempDir;
  let fileKey;
  let stage = "initializing";

  try {
    if (!req.file) {
      return errorResponse(res, 400, "No file uploaded");
    }

    if (!isR2Configured()) {
      return errorResponse(res, 500, "R2 storage is not configured");
    }

    stage = "writing-temp-file";
    const temp = await writeBufferToTempFile(req.file.buffer, req.file.originalname);
    tempPath = temp.tempPath;
    tempDir = temp.tempDir;

    stage = "extracting-pdf-text";
    let text;
    try {
      text = await extractTextFromPDF(tempPath);
    } catch (parseError) {
      console.warn("Primary PDF parse failed, falling back to scanned OCR:", parseError.message);
      text = "";
    }

    if (!text || text.trim().length < 50) {
      stage = "extracting-scanned-pdf-text";
      text = await extractTextFromScannedPDF(tempPath);
    }

    if (!text || text.trim().length < 50) {
      await cleanupTempFile(tempPath, tempDir);
      return errorResponse(res, 400, "Could not extract text from PDF");
    }

    stage = "splitting-text";
    const textChunks = splitIntoChunks(text);

    stage = "creating-embeddings";
    const embeddings = await Promise.all(
      textChunks.map((chunk) => getEmbedding(chunk))
    );

    const chunks = textChunks
      .map((chunkText, i) => ({
        text: chunkText,
        embedding: embeddings[i],
        sourceType: "pdf",
        sourceName: req.file.originalname
      }))
      .filter(
        (chunk) =>
          chunk.text.trim().length > 100 &&
          chunk.embedding &&
          chunk.embedding.length > 0
      );

    stage = "building-r2-key";
    fileKey = buildObjectKey("pdfs", req.file.originalname);

    stage = "uploading-to-r2";
    await uploadObject({
      key: fileKey,
      body: req.file.buffer,
      contentType: req.file.mimetype
    });

    stage = "saving-pdf-document";
    const pdfId = new mongoose.Types.ObjectId();
    const pdf = new Pdf({
      _id: pdfId,
      userId: req.userId,
      fileName: req.file.originalname,
      filePath: `api/files/pdf/${pdfId}`,
      fileKey,
      mimeType: req.file.mimetype,
      extractedText: text,
      chunks,
      size: req.file.size
    });

    await pdf.save();

    stage = "updating-chunk-cache";
    addPdfChunks(req.userId, chunks);

    stage = "cleaning-temp-files";
    await cleanupTempFile(tempPath, tempDir);

    res.status(201).json({
      message: "Document processed successfully",
      pdf
    });
  } catch (error) {
    console.error(`PDF Upload Error at stage "${stage}":`, error);

    if (fileKey) {
      await deleteObject(fileKey).catch(() => {});
    }

    if (tempPath || tempDir) {
      await cleanupTempFile(tempPath, tempDir);
    }

    errorResponse(res, 500, formatPdfUploadError(error));
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

    if (pdf.fileKey) {
      await deleteObject(pdf.fileKey);
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
