const { Worker } = require("bullmq");
const redis = require("../config/redis");

const Todo = require("../models/todo");
const User = require("../models/user");
const { sendReminderEmail } = require("../services/emailService");

const worker = new Worker(
  "reminder-queue",
  async (job) => {
    const { todoId } = job.data;

    console.log("⏰ Processing reminder:", todoId);

    // Fetch todo
    const todo = await Todo.findById(todoId);
    if (!todo) return;

    // 🔥 CONDITION CHECK
    if (todo.completed) {
      console.log("✅ Task already completed. Skipping.");
      return;
    }

    if (todo.notified) {
      console.log("⚠️ Already notified. Skipping.");
      return;
    }

    // Get user
    const user = await User.findById(todo.userId);
    if (!user) return;

    // 🔥 SEND EMAIL
    await sendReminderEmail(
      user.email,
      todo.text,
      todo.scheduledTime
    );

    // Mark notified
    todo.notified = true;
    await todo.save();

    console.log("📩 Reminder sent:", user.email);
  },
  {
    connection: redis
  }
);

console.log("🔥 Reminder worker running");