const { splitIntoChunks } = require("../services/pdfService");
const { extractTextWithPython } = require("../services/pythonPdfService");
const { getEmbedding } = require("../services/embeddingService");
const { addPdfChunks } = require("../services/chunkCacheService");
const { writeBufferToTempFile, cleanupTempFile } = require("../services/tempFileService");
const fs = require("fs");

const chatPdf = async (req, res) => {
  const sessionId = req.body.sessionId;
  let tempPath = null;
  let tempDir = null;
  let isCreatedTemp = false;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (req.file.path) {
      tempPath = req.file.path;
    } else if (req.file.buffer) {
      const temp = await writeBufferToTempFile(req.file.buffer, req.file.originalname);
      tempPath = temp.tempPath;
      tempDir = temp.tempDir;
      isCreatedTemp = true;
    } else {
      return res.status(400).json({ message: "Invalid file payload" });
    }

    const extractionResult = await extractTextWithPython(tempPath);
    const text = extractionResult.text;

    const textChunks = splitIntoChunks(text);

    let chunks = [];

    for (const chunkText of textChunks) {
      const embedding = await getEmbedding(chunkText);

      chunks.push({
        text: chunkText,
        embedding,
        sourceType: "pdf",
        sourceName: req.file.originalname
      });
    }

    addPdfChunks(req.userId, chunks);

    const Conversation = require("../models/conversation");

    if (sessionId) {
      let conversation = await Conversation.findOne({
        sessionId,
        userId: req.userId
      });

      if (!conversation) {
        conversation = new Conversation({
          userId: req.userId,
          sessionId,
          messages: []
        });
      }

      conversation.lastPdfChunks = chunks;
      await conversation.save();
    }

    res.json({
      message: "PDF added to chat knowledge"
    });
  } catch (err) {
    console.error("Chat PDF Error:", err);
    res.status(500).json({
      message: typeof err.message === "string" ? err.message : "PDF chat upload failed"
    });
  } finally {
    if (isCreatedTemp && (tempPath || tempDir)) {
      await cleanupTempFile(tempPath, tempDir).catch(() => {});
    } else if (tempPath && fs.existsSync(tempPath)) {
      // Clean up uploaded disk file post-processing
      fs.unlink(tempPath, () => {});
    }
  }
};

module.exports = { chatPdf };