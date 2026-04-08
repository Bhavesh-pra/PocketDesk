const mongoose = require("mongoose");

const videoNoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  videoUrl: {
    type: String,
    required: true
  },

  videoTitle: {
    type: String,
    default: ""
  },

  content: {
    type: String,
    default: ""
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index so lookup by userId + videoUrl is fast
videoNoteSchema.index({ userId: 1, videoUrl: 1 }, { unique: true });

module.exports = mongoose.model("VideoNote", videoNoteSchema);
