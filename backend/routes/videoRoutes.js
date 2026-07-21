const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
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
