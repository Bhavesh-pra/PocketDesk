const poppler = require("pdf-poppler");
const { createWorker } = require("tesseract.js");
const fs = require("fs");
const path = require("path");


/*
---------------------------------------
OCR TEXT FROM SINGLE IMAGE
---------------------------------------
*/

let worker;
let workerPromise;

const initWorker = async () => {
  if (worker) return worker;

  if (!workerPromise) {
    workerPromise = createWorker("eng").then((w) => {
      worker = w;
      return worker;
    });
  }

  return workerPromise;
};

const extractTextFromImage = async (imagePath) => {

  try {

    const worker = await initWorker();

    const { data } = await worker.recognize(imagePath);

    if (!data.text || data.text.trim().length < 10) {
      console.log("⚠️ OCR returned very low text");
      return "";
    }

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

  if (!text || text.trim().length < 50) {
      console.log("⚠️ OCR failed for scanned PDF");
      return "";
    }

    return text;

};


module.exports = {

  extractTextFromImage,
  extractTextFromScannedPDF

};