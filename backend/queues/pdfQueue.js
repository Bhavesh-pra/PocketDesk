const { Queue } = require("bullmq");
const redis = require("../config/redis");

const pdfQueue = new Queue("pdf-processing", {
  connection: redis
});

module.exports = pdfQueue;