const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  text: {
    type: String,
    required: true
  },

  scheduledTime: {
    type: Date,
    required: true
  },

  completed: {
    type: Boolean,
    default: false
  },

  notified: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  priority: {
  type: String,
  enum: ["low", "medium", "high"],
  default: "medium"
}
});

todoSchema.index({ userId: 1, scheduledTime: 1 });

module.exports = mongoose.model("Todo", todoSchema);