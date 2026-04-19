const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const connectDB =
require("./config/db");

const { loadChunks } =
require("./services/chunkCacheService");

const authRoutes =
require("./routes/authRoutes");

require("./workers/reminderWorker");

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173", 
      "http://localhost:5174", 
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(helmet({
  crossOriginResourcePolicy: false,
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts, please try again later" }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later" }
});

app.use("/api", globalLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);
app.use("/api/auth/login", loginLimiter);

app.use(express.json({ limit: "10mb" }));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body, { replaceWith: "_" });
  if (req.query) mongoSanitize.sanitize(req.query, { replaceWith: "_" });
  if (req.params) mongoSanitize.sanitize(req.params, { replaceWith: "_" });
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/health/ready", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState === 1) {
      res.json({ status: "ready", database: "connected" });
    } else {
      res.status(503).json({ status: "not ready", database: "disconnected" });
    }
  } catch (err) {
    res.status(503).json({ status: "error" });
  }
});

const albumRoutes = require("./routes/albumRoutes");
app.use("/api/albums", albumRoutes);

const imageRoutes = require("./routes/imageRoutes");
app.use("/api/images", imageRoutes);

app.use("/uploads", express.static("uploads", {
  maxAge: "1d",
  etag: true
}));

connectDB().then(async () => {
  await loadChunks();
});

const todoRoutes = require("./routes/todoRoutes");
app.use("/api/todo", todoRoutes);

const chatRoutes = require("./routes/chatRoutes");
app.use("/api/chat", chatRoutes);

const pdfRoutes = require("./routes/pdfRoutes");
app.use("/api/pdf", pdfRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

app.use("/api/auth", authRoutes);

const contactRoutes = require("./routes/contactRoutes");
app.use("/api/contact", contactRoutes);

const noteRoutes = require("./routes/noteRoutes");
app.use("/api/notes", noteRoutes);

const videoRoutes = require("./routes/videoRoutes");
app.use("/api/video", videoRoutes);

app.get("/", (req, res) => {
  res.json({ 
    name: "PocketDesk API", 
    status: "running",
    version: "1.0.0"
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS not allowed" });
  }
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    const mongoose = require("mongoose");
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    const mongoose = require("mongoose");
    mongoose.connection.close();
    process.exit(0);
  });
});