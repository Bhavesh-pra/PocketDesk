const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const Pdf = require("../models/pdf");
const Image = require("../models/image");
const Video = require("../models/video");
const { createSignedGetUrl } = require("../services/r2StorageService");

const models = {
  pdf: Pdf,
  image: Image,
  video: Video
};

router.get("/:type/:id", authMiddleware, async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = models[type];

    if (!Model) {
      return res.status(404).json({ message: "Unsupported file type" });
    }

    const doc = await Model.findOne({
      _id: id,
      userId: req.userId
    });

    if (!doc || !doc.fileKey) {
      return res.status(404).json({ message: "File not found" });
    }

    const signedUrl = await createSignedGetUrl(doc.fileKey, 60 * 10);
    return res.redirect(signedUrl);
  } catch (err) {
    console.error("File access error:", err);
    return res.status(500).json({ message: "Failed to load file" });
  }
});

module.exports = router;
