const Pdf = require("../models/pdf");

const { addPdfChunks, loadChunks } =
require("../services/chunkCacheService");

const {
  extractTextFromPDF,
  splitIntoChunks
} = require("../services/pdfService");

const {
  extractTextFromScannedPDF
} = require("../services/ocrService");

const {
  getEmbedding
} = require("../services/embeddingService");

const fs = require("fs");


/*
-----------------------------------------
UPLOAD PDF
-----------------------------------------
*/

const uploadPdf = async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    // STEP 1 — Try normal text extraction
    let text = await extractTextFromPDF(req.file.path);

    // STEP 2 — If scanned PDF → OCR
    if (!text || text.trim().length < 50) {

      console.log("Scanned PDF detected → running OCR");

      text = await extractTextFromScannedPDF(
        req.file.path
      );

    }

    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        message: "Could not extract text from PDF"
      });
    }


    /*
    -----------------------------------------
    STEP 3 — Split into chunks
    -----------------------------------------
    */

    const textChunks = splitIntoChunks(text);


    /*
    -----------------------------------------
    STEP 4 — Generate embeddings (PARALLEL)
    -----------------------------------------
    */

    const embeddings = await Promise.all(
      textChunks.map(chunk => getEmbedding(chunk))
    );


    /*
    -----------------------------------------
    STEP 5 — Build chunk objects
    -----------------------------------------
    */

    const chunks = textChunks
    .map((chunkText, i) => ({
    text: chunkText,
    embedding: embeddings[i],
    sourceType: "pdf",
    sourceName: req.file.originalname
  }))
      .filter(chunk =>
  chunk.text.trim().length > 100 &&
  chunk.embedding &&
  chunk.embedding.length > 0
);



    /*
    -----------------------------------------
    STEP 6 — Save PDF in DB
    -----------------------------------------
    */

    const pdf = new Pdf({

      userId: req.userId,

      fileName: req.file.originalname,

      filePath: req.file.path.replace(/\\/g, "/"),

      extractedText: text,
      chunks: chunks,
      size: req.file.size
    });

    await pdf.save();



    /*
    -----------------------------------------
    STEP 7 — Update memory chunk cache
    -----------------------------------------
    */

    addPdfChunks(req.userId, chunks);



    /*
    -----------------------------------------
    RESPONSE
    -----------------------------------------
    */

    res.json({

      message: "Document processed successfully",

      pdf: pdf

    });

  } catch (error) {

    console.error("PDF Upload Error:", error);

    res.status(500).json({

      message: "Upload Failed"

    });

  }

};




/*
-----------------------------------------
GET ALL USER PDFs
-----------------------------------------
*/

const getAllPdfs = async (req, res) => {

  try {

    const pdfs = await Pdf.find({

      userId: req.userId

    });

    res.json(pdfs);

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message: "Fetch Failed"

    });

  }

};




/*
-----------------------------------------
DELETE PDF
-----------------------------------------
*/

const deletePdf = async (req, res) => {

  try {

    const pdf = await Pdf.findOne({

      _id: req.params.id,

      userId: req.userId

    });

    if (!pdf) {

      return res.status(404).json({

        message: "PDF Not Found"

      });

    }


    // Delete file from disk

    if (fs.existsSync(pdf.filePath)) {

      fs.unlinkSync(pdf.filePath);

    }


    // Delete from DB

    await Pdf.findOneAndDelete({

      _id: req.params.id,

      userId: req.userId

    });


    // Reload chunk cache

    await loadChunks();


    res.json({

      message: "PDF Deleted Successfully"

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message: "Delete Failed"

    });

  }

};



module.exports = {

  uploadPdf,
  getAllPdfs,
  deletePdf

};