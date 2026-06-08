const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const Pdf = require("../models/pdf");
const Image = require("../models/image");
const Video = require("../models/video");
const Todo = require("../models/todo");
const Conversation = require("../models/conversation");
const Album = require("../models/album");

/**
 * GET /api/search?q=<query>
 * Searches across PDFs, images, videos, todos, and chats for the current user.
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string" || q.trim().length === 0) {
      return res.json({ results: [] });
    }

    const query = q.trim();
    const userId = req.userId;

    // Build a case-insensitive regex for text matching
    const regex = new RegExp(query, "i");

    // Run all searches in parallel
    const [pdfs, images, videos, todos, conversations, albums] =
      await Promise.all([
        Pdf.find({ userId, fileName: regex })
          .select("fileName uploadedAt size")
          .limit(10)
          .lean(),

        Image.find({ userId, fileName: regex })
          .select("fileName albumId createdAt")
          .limit(10)
          .lean(),

        Video.find({ userId, fileName: regex })
          .select("fileName createdAt")
          .limit(10)
          .lean(),

        Todo.find({ userId, text: regex })
          .select("text completed scheduledTime priority")
          .limit(10)
          .lean(),

        Conversation.find({
          userId,
          "messages.content": regex,
        })
          .select("sessionId messages createdAt")
          .limit(10)
          .lean(),

        Album.find({ userId, name: regex })
          .select("name createdAt")
          .limit(10)
          .lean(),
      ]);

    // Normalise into a unified shape
    const results = [];

    for (const pdf of pdfs) {
      results.push({
        type: "pdf",
        id: pdf._id,
        title: pdf.fileName,
        subtitle: `PDF · ${formatBytes(pdf.size)}`,
        path: "/pdfs",
        date: pdf.uploadedAt,
      });
    }

    for (const album of albums) {
      results.push({
        type: "album",
        id: album._id,
        title: album.name,
        subtitle: "Album",
        path: `/images/${album._id}`,
        date: album.createdAt,
      });
    }

    for (const img of images) {
      results.push({
        type: "image",
        id: img._id,
        title: img.fileName,
        subtitle: "Image",
        path: img.albumId ? `/images/${img.albumId}` : "/images",
        date: img.createdAt,
      });
    }

    for (const vid of videos) {
      results.push({
        type: "video",
        id: vid._id,
        title: vid.fileName,
        subtitle: "Video",
        path: "/videos",
        date: vid.createdAt,
      });
    }

    for (const todo of todos) {
      results.push({
        type: "todo",
        id: todo._id,
        title: todo.text,
        subtitle: `To-Do · ${todo.priority} · ${todo.completed ? "Done" : "Pending"}`,
        path: "/todo",
        date: todo.scheduledTime,
      });
    }

    for (const conv of conversations) {
      // Find the first message matching the query for a snippet
      const matchMsg = conv.messages?.find((m) => regex.test(m.content));
      const snippet = matchMsg
        ? matchMsg.content.substring(0, 80)
        : "Chat conversation";

      results.push({
        type: "chat",
        id: conv.sessionId,
        title: snippet,
        subtitle: "Chat",
        path: `/chat/${conv.sessionId}`,
        date: conv.createdAt,
      });
    }

    // Sort by date descending (newest first)
    results.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ results: results.slice(0, 25) });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

module.exports = router;
