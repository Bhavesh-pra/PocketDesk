const fs = require("fs");
const path = require("path");
const axios = require("axios");
let FormData;
try {
  FormData = require("form-data");
} catch (err) {
  FormData = globalThis.FormData;
}

/**
 * Extract text from a PDF file by sending it as a stream to the Python PDFium service.
 *
 * @param {string} filePath - Absolute path to the local PDF file on disk.
 * @returns {Promise<{text: string, pages: number, ocr_pages: number[], native_text_pages: number, processing_time_seconds: number, diagnostics: object}>}
 */
const extractTextWithPython = async (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error(`PDF file not found at path: ${filePath}`);
  }

  const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";
  const endpoint = `${pythonServiceUrl.replace(/\/$/, "")}/process/pdf`;

  console.log(`[PYTHON PDF] Streaming ${filePath} to ${endpoint}`);

  try {
    const fileName = path.basename(filePath);
    const form = new FormData();

    if (form.append && typeof form.getHeaders === "function") {
      // npm form-data package with stream
      form.append("file", fs.createReadStream(filePath), {
        filename: fileName,
        contentType: "application/pdf"
      });

      const response = await axios.post(endpoint, form, {
        headers: form.getHeaders(),
        timeout: 300000 // 300 seconds HTTP timeout
      });
      return _processResponse(response.data);
    } else {
      // Native web FormData with Blob
      const fileBuffer = fs.readFileSync(filePath);
      const blob = new Blob([fileBuffer], { type: "application/pdf" });
      form.append("file", blob, fileName);

      const response = await axios.post(endpoint, form, {
        timeout: 300000
      });
      return _processResponse(response.data);
    }
  } catch (error) {
    if (error.response) {
      const detail = error.response.data?.details || error.response.data?.error || error.response.statusText;
      console.error(`[PYTHON PDF] HTTP ${error.response.status} error from Python service:`, detail);
      throw new Error(`Python PDF service error (${error.response.status}): ${detail}`);
    } else if (error.code === "ECONNREFUSED") {
      console.error(`[PYTHON PDF] Connection refused at ${endpoint}`);
      throw new Error(`Python PDF processing service is unreachable at ${pythonServiceUrl}`);
    } else if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
      console.error(`[PYTHON PDF] Request timeout to ${endpoint}`);
      throw new Error("Python PDF processing service request timed out (exceeded 300s limit)");
    } else {
      console.error(`[PYTHON PDF] Extraction error:`, error.message);
      throw error;
    }
  }
};

const _processResponse = (data) => {
  if (!data || data.success === false || typeof data.text !== "string") {
    const errMsg = data?.error || data?.details || "Failed to extract text from PDF";
    throw new Error(`Python PDF service processing error: ${errMsg}`);
  }

  if (data.text.trim().length < 50) {
    throw new Error("Could not extract meaningful text from PDF (text under 50 characters)");
  }

  console.log(
    `[PYTHON PDF] Extraction complete: ${data.pages} pages, ${data.ocr_pages?.length || 0} OCR pages, ` +
    `${data.text.length} chars in ${data.processing_time_seconds}s`
  );

  return data;
};

module.exports = {
  extractTextWithPython
};
