const mongoose = require("mongoose");
const Image = require("../models/image");
const { extractTextFromImage } = require("../services/ocrService");
const { splitIntoChunks } = require("../services/pdfService");
const { getEmbedding } = require("../services/embeddingService");
const { addImageChunks, loadChunks } = require("../services/chunkCacheService");
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

const deleteImage = async (req, res) => {
  try {
    const image = await Image.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!image) {
      return res.status(404).json({
        message: "Image not found"
      });
    }

    if (image.fileKey) {
      await deleteObject(image.fileKey);
    }

    await Image.deleteOne({
      _id: req.params.id,
      userId: req.userId
    });

    await loadChunks();

    res.json({
      message: "Image deleted"
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Delete failed"
    });
  }
};

const uploadImage = async (req, res) => {
  let tempPath;
  let tempDir;
  let fileKey;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    if (!isR2Configured()) {
      return res.status(500).json({ message: "R2 storage is not configured" });
    }

    const temp = await writeBufferToTempFile(req.file.buffer, req.file.originalname);
    tempPath = temp.tempPath;
    tempDir = temp.tempDir;

    const text = await extractTextFromImage(tempPath);
    const textChunks = splitIntoChunks(text || "");

    const embeddings = await Promise.all(
      textChunks.map((chunkText) => getEmbedding(chunkText))
    );

    const chunks = textChunks
      .map((chunkText, i) => ({
        text: chunkText,
        embedding: embeddings[i],
        sourceType: "image",
        sourceName: req.file.originalname
      }))
      .filter((chunk) => chunk.text.trim().length > 0);

    fileKey = buildObjectKey("images", req.file.originalname);

    await uploadObject({
      key: fileKey,
      body: req.file.buffer,
      contentType: req.file.mimetype
    });

    const imageId = new mongoose.Types.ObjectId();
    const image = new Image({
      _id: imageId,
      userId: req.userId,
      albumId: req.params.albumId,
      fileName: req.file.originalname,
      filePath: `api/files/image/${imageId}`,
      fileKey,
      mimeType: req.file.mimetype,
      extractedText: text,
      chunks,
      size: req.file.size
    });

    await image.save();

    addImageChunks(req.userId, chunks);

    res.json({
      message: "Image uploaded + vectorized",
      image
    });
  } catch (err) {
    console.log(err);

    if (fileKey) {
      await deleteObject(fileKey).catch(() => {});
    }

    if (tempPath || tempDir) {
      await cleanupTempFile(tempPath, tempDir);
    }

    res.status(500).json({
      message: "Image upload failed"
    });
  } finally {
    await cleanupTempFile(tempPath, tempDir);
  }
};

const getImages = async (req, res) => {
  try {
    const albumId = req.params.albumId;

    const images = await Image.find({
      albumId,
      userId: req.userId
    });

    res.json(images);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to load images"
    });
  }
};

module.exports = {
  uploadImage,
  getImages,
  deleteImage
};
