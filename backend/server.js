const express = require("express");
const cors = require("cors");

require("dotenv").config();

const connectDB =
require("./config/db");

const { loadChunks } =
require("./services/chunkCacheService");

const authRoutes =
require("./routes/authRoutes");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Middleware
app.use(express.json());



const albumRoutes = require("./routes/albumRoutes");

app.use("/api/albums",albumRoutes);

const imageRoutes = require("./routes/imageRoutes");

app.use("/api/images",imageRoutes);

app.use("/uploads",express.static("uploads"));

// Connect Database

connectDB();


// Load Chunk Cache

loadChunks();


// Routes

const chatRoutes =
require("./routes/chatRoutes");

const pdfRoutes =
require("./routes/pdfRoutes");

app.use("/api/pdf", pdfRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);

// Test Route

app.get("/", (req,res)=>{

res.send("PocketDesk API Running");

});
app.use("/uploads", express.static("uploads"));

// Server

const PORT =
process.env.PORT || 5000;

app.listen(PORT, ()=>{

console.log(
`Server running on port ${PORT}`
);


});