const Tesseract = require("tesseract.js");
const { fromPath } = require("pdf2pic");

/*
---------------------------------------
OCR TEXT FROM SINGLE IMAGE
---------------------------------------
*/

const extractTextFromImage = async (imagePath) => {

try {

const result = await Tesseract.recognize(
imagePath,
"eng",
{
logger: m => console.log(m.status)
}
);

return result.data.text;

} catch (err) {

console.error("OCR image error:", err);
return "";

}

};


/*
---------------------------------------
OCR TEXT FROM MULTIPLE IMAGES
---------------------------------------
*/

const extractTextFromImages = async (imagePaths) => {

let combinedText = "";

for(const img of imagePaths){

const text = await extractTextFromImage(img);

combinedText += text + "\n";

}

return combinedText;

};


/*
---------------------------------------
CONVERT PDF PAGES → IMAGES
---------------------------------------
*/

const convertPdfToImages = async (pdfPath) => {

const convert = fromPath(pdfPath, {

density: 150,
format: "png",
width: 1200,
height: 1200,
savePath: "./temp"

});

const imagePaths = [];

try {

for(let page = 1; page <= 10; page++){

const result = await convert(page);

if(!result?.path){
break;
}

imagePaths.push(result.path);

}

} catch(err){

console.log("PDF conversion stopped");

}

return imagePaths;

};


/*
---------------------------------------
OCR TEXT FROM PDF (SCANNED)
---------------------------------------
*/

const extractTextFromScannedPDF = async (pdfPath) => {

try {

const images =
await convertPdfToImages(pdfPath);

if(images.length === 0){
return "";
}

const text =
await extractTextFromImages(images);

return text;

} catch(err){

console.error("PDF OCR error:", err);

return "";

}

};


module.exports = {

extractTextFromImage,
extractTextFromImages,
convertPdfToImages,
extractTextFromScannedPDF

};