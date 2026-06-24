const { Worker } = require("bullmq");
const redis = require("../config/redis");

const { processPdf } =
  require("../services/pdfProcessingService");

if (!redis) {
  console.log("[REDIS] pdfWorker disabled — REDIS_URL not set.");
} else {
  const worker = new Worker(
    "pdf-processing",
    async job => {
      const { filePath, userId, fileName } = job.data;
      await processPdf(filePath, userId, fileName);
    },
    { connection: redis }
  );

  console.log("[REDIS] PDF worker running");
}