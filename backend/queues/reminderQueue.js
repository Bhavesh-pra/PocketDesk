const { Queue } = require("bullmq");
const redis = require("../config/redis");

// Only create the queue if Redis is available.
let reminderQueue = null;

if (redis) {
  reminderQueue = new Queue("reminder-queue", {
    connection: redis
  });
  console.log("[REDIS] reminderQueue initialized");
}

module.exports = reminderQueue;