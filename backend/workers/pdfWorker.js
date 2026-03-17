const { Worker } = require("bullmq");
const redis = require("../config/redis");

const { processPdf } =
require("../services/pdfProcessingService");

const worker = new Worker(
  "pdf-processing",
  async job => {

    const { filePath, userId, fileName } = job.data;

    await processPdf(filePath, userId, fileName);

  },
  { connection: redis }
);

console.log("PDF worker running");