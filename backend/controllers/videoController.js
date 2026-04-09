const Video = require("../models/video");
const VideoNote = require("../models/videoNote");
const { extractAudio } = require("../services/videoService");
const { transcribeAudio } = require("../services/transcriptionService");
const { splitIntoChunks } = require("../services/pdfService");
const { getEmbedding } = require("../services/embeddingService");
const { addPdfChunks } = require("../services/chunkCacheService");
const fs = require("fs");

// =====================
// UPLOAD VIDEO
// =====================
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    const videoPath = req.file.path;

    // 1. Extract audio
    const audioPath = await extractAudio(videoPath);

    // 2. Transcribe
    const transcript = await transcribeAudio(audioPath);

    // Clean up audio file after transcription
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

    // 3. Chunk
    const textChunks = splitIntoChunks(transcript);

    // 4. Embeddings
    const embeddings = await Promise.all(
      textChunks.map((chunk) => getEmbedding(chunk))
    );

    // FIX: add sourceType and sourceName to every chunk
    const chunks = textChunks.map((text, i) => ({
      text,
      embedding: embeddings[i],
      sourceType: "video",
      sourceName: req.file.originalname
    }));

    // 5. Save to DB
    const video = await Video.create({
      userId: req.userId,
      fileName: req.file.originalname,
      filePath: videoPath,
      transcript,
      chunks,
      size: req.file.size
    });

    // FIX: add to in-memory chunk cache immediately so RAG works without restart
    addPdfChunks(req.userId, chunks);

    res.json({
      message: "Video processed successfully",
      video
    });

  } catch (err) {
    console.error("Video upload error:", err);
    res.status(500).json({ message: "Video upload failed" });
  }
};

// =====================
// GET ALL VIDEOS
// =====================
const getVideos = async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.userId })
      .select("-chunks -transcript") // don't send heavy embedding data
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

    if (fs.existsSync(video.filePath)) {
      fs.unlinkSync(video.filePath);
    }

    await Video.deleteOne({ _id: req.params.id });

    res.json({ message: "Video deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};

// =====================
// YOUTUBE NOTE — GET
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

    // Return empty string if no note yet — not an error
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
// YOUTUBE NOTE — SAVE (upsert)
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