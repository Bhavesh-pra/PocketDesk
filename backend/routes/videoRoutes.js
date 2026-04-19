const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// FIX: ensure uploads/videos/ exists before multer tries to write to it
const videosDir = path.join(__dirname, "../uploads/videos");
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

const {
  uploadVideo,
  getVideos,
  deleteVideo,
  getVideoNote,
  saveVideoNote
} = require("../controllers/videoController");

router.post("/upload", authMiddleware, upload.single("video"), uploadVideo);
router.get("/list", authMiddleware, getVideos);
router.delete("/:id", authMiddleware, deleteVideo);
router.get("/note", authMiddleware, getVideoNote);
router.post("/note", authMiddleware, saveVideoNote);

module.exports = router;