const { Queue } = require("bullmq");
const redis = require("../config/redis");

// Only create the queue if Redis is available.
let pdfQueue = null;

if (redis) {
  pdfQueue = new Queue("pdf-processing", {
    connection: redis
  });
  console.log("[REDIS] pdfQueue initialized");
}

module.exports = pdfQueue;