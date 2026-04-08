const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    fileName: {
        type: String,
        required: true
    },

    filePath: {
        type: String,
        required: true
    },

    extractedText: {
        type: String
    },

    chunks: [
        {
            text: String,
            embedding: [Number],
            sourceType: String,
            sourceName: String
        }
    ],

    uploadedAt: {
        type: Date,
        default: Date.now
    }

});

pdfSchema.index({ userId: 1 });

module.exports = mongoose.model("Pdf", pdfSchema);