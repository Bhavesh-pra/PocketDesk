const mongoose = require("mongoose");
const Video = require("../models/video");
const VideoNote = require("../models/videoNote");
const { extractAudio } = require("../services/videoService");
const { transcribeAudio } = require("../services/transcriptionService");
const { splitIntoChunks } = require("../services/pdfService");
const { getEmbedding } = require("../services/embeddingService");
const { addPdfChunks } = require("../services/chunkCacheService");
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

// =====================
// UPLOAD VIDEO
// =====================
const uploadVideo = async (req, res) => {
  let tempPath;
  let tempDir;
  let fileKey;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    if (!isR2Configured()) {
      return res.status(500).json({ message: "R2 storage is not configured" });
    }

    const temp = await writeBufferToTempFile(req.file.buffer, req.file.originalname);
    tempPath = temp.tempPath;
    tempDir = temp.tempDir;

    // 1. Extract audio
    const audioPath = await extractAudio(tempPath);

    // 2. Transcribe
    const transcript = await transcribeAudio(audioPath);

    // 3. Chunk
    const textChunks = splitIntoChunks(transcript);

    // 4. Embeddings
    const embeddings = await Promise.all(
      textChunks.map((chunk) => getEmbedding(chunk))
    );

    const chunks = textChunks.map((text, i) => ({
      text,
      embedding: embeddings[i],
      sourceType: "video",
      sourceName: req.file.originalname
    }));

    fileKey = buildObjectKey("videos", req.file.originalname);

    await uploadObject({
      key: fileKey,
      body: req.file.buffer,
      contentType: req.file.mimetype
    });

    // 5. Save to DB
    const videoId = new mongoose.Types.ObjectId();
    const video = new Video({
      _id: videoId,
      userId: req.userId,
      fileName: req.file.originalname,
      filePath: `api/files/video/${videoId}`,
      fileKey,
      mimeType: req.file.mimetype,
      transcript,
      chunks,
      size: req.file.size
    });

    await video.save();

    // Add to in-memory chunk cache immediately so RAG works without restart
    addPdfChunks(req.userId, chunks);

    await cleanupTempFile(audioPath, undefined);
    await cleanupTempFile(tempPath, tempDir);

    res.json({
      message: "Video processed successfully",
      video
    });
  } catch (err) {
    console.error("Video upload error:", err);

    if (fileKey) {
      await deleteObject(fileKey).catch(() => {});
    }

    if (tempPath || tempDir) {
      await cleanupTempFile(tempPath, tempDir);
    }

    res.status(500).json({ message: "Video upload failed" });
  }
};

// =====================
// GET ALL VIDEOS
// =====================
const getVideos = async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.userId })
      .select("-chunks -transcript")
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch videos" });
  }
};

// =====================
// DELETE VIDEO
// =====================
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (video.fileKey) {
      await deleteObject(video.fileKey);
    }

    await Video.deleteOne({
      _id: req.params.id,
      userId: req.userId
    });

    res.json({ message: "Video deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};

// =====================
// YOUTUBE NOTE - GET
// =====================
const getVideoNote = async (req, res) => {
  try {
    const { videoUrl } = req.query;

    if (!videoUrl) {
      return res.status(400).json({ message: "videoUrl required" });
    }

    const note = await VideoNote.findOne({
      userId: req.userId,
      videoUrl
    });

    res.json({
      content: note ? note.content : "",
      videoTitle: note?.videoTitle || ""
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch note" });
  }
};

// =====================
// YOUTUBE NOTE - SAVE (upsert)
// =====================
const saveVideoNote = async (req, res) => {
  try {
    const { videoUrl, content, videoTitle } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ message: "videoUrl required" });
    }

    const note = await VideoNote.findOneAndUpdate(
      { userId: req.userId, videoUrl },
      { content, videoTitle, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ message: "Note saved", note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save note" });
  }
};

module.exports = {
  uploadVideo,
  getVideos,
  deleteVideo,
  getVideoNote,
  saveVideoNote
};
