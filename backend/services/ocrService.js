const poppler = require("pdf-poppler");
const { createWorker } = require("tesseract.js");
const fs = require("fs");
const path = require("path");


/*
---------------------------------------
OCR TEXT FROM SINGLE IMAGE
---------------------------------------
*/

const extractTextFromImage = async (imagePath) => {

  try {

    const worker = await createWorker("eng");

    const { data } = await worker.recognize(imagePath);

    await worker.terminate();

    return data.text;

  } catch (err) {

    console.error("OCR image error:", err);
    return "";

  }

};


/*
---------------------------------------
OCR TEXT FROM PDF (SCANNED)
---------------------------------------
*/

const extractTextFromScannedPDF = async (pdfPath) => {

  const outputDir = path.join(__dirname, "../uploads/temp");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Clean temp folder before processing
  const oldFiles = fs.readdirSync(outputDir);
  for (const file of oldFiles) {
    fs.unlinkSync(path.join(outputDir, file));
  }

  const options = {
    format: "png",
    out_dir: outputDir,
    out_prefix: "page",
    dpi: 300,
    size: "2000x2000"
  };

  console.log("Converting PDF pages to images...");

  await poppler.convert(pdfPath, options);

  const images = fs.readdirSync(outputDir)
    .filter(file => file.endsWith(".png"));

  console.log(`OCR processing ${images.length} pages`);

  const worker = await createWorker("eng");

  let text = "";

  for (const img of images) {

    const imagePath = path.join(outputDir, img);

    const { data } = await worker.recognize(imagePath);

    text += data.text + "\n";

    fs.unlinkSync(imagePath);

  }

  await worker.terminate();

  return text;

};


module.exports = {

  extractTextFromImage,
  extractTextFromScannedPDF

};