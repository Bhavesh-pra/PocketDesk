const { Redis } = require("ioredis");

// Redis is optional. It is only used for BullMQ queues (reminders, PDF processing).
// On Railway, set REDIS_URL to enable queue features.
// Without Redis, the app starts normally — queues are simply disabled.

let redis = null;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  redis.on("connect", () => {
    console.log("[REDIS] Connected successfully");
  });

  redis.on("error", (err) => {
    console.error("[REDIS] Connection error:", err.message);
  });

  console.log("[REDIS] Enabled — connecting to REDIS_URL");
} else {
  console.log("[REDIS] Disabled — REDIS_URL not set. Queue features (reminders, PDF worker) will be unavailable.");
}

module.exports = redis;