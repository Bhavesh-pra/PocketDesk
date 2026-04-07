const { Queue } = require("bullmq");
const redis = require("../config/redis");

const reminderQueue = new Queue("reminder-queue", {
  connection: redis
});

module.exports = reminderQueue;