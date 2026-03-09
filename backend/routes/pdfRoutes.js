const express = require("express");

const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const { upload } =
require("../services/pdfService");

const {
uploadPdf,
getAllPdfs,
deletePdf
} = require("../controllers/pdfController");


// Upload PDF

router.post(
"/upload",
authMiddleware,
upload.single("pdf"),   // IMPORTANT
uploadPdf
);


// Get PDFs

router.get(
"/all",
authMiddleware,
getAllPdfs
);


// Delete PDF

router.delete(
"/:id",
authMiddleware,
deletePdf
);


module.exports = router;