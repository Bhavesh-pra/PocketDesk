const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  fileName: String,

  filePath: String,

  transcript: String,

  chunks: [
    {
      text: String,
      embedding: [Number],
      sourceType: String,
      sourceName: String
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

videoSchema.index({ userId: 1 });

module.exports = mongoose.model("Video", videoSchema);