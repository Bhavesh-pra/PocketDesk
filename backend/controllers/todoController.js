const Todo = require("../models/todo");
const reminderQueue = require("../queues/reminderQueue");

const errorResponse = (res, status, message) => {
  return res.status(status).json({ error: message });
};

const createTodo = async (req, res) => {
  try {
    const { scheduledTime, priority } = req.body;
    const text = req.body.title || req.body.text;

    if (!text || !scheduledTime) {
      return errorResponse(res, 400, "Text and scheduled time are required");
    }

    const todo = await Todo.create({
      userId: req.userId,
      text,
      scheduledTime,
      priority: priority || "medium"
    });

    const delay = new Date(scheduledTime).getTime() - Date.now() - (60 * 60 * 1000);

    if (delay > 0) {
      await reminderQueue.add(
        "send-reminder",
        { todoId: todo._id },
        { delay }
      );
    }

    res.status(201).json(todo);

  } catch (err) {
    console.error("Create todo error:", err);
    errorResponse(res, 500, "Failed to create todo");
  }
};

const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({
      userId: req.userId
    }).sort({ scheduledTime: 1 });

    res.json(todos);
  } catch (err) {
    console.error("Get todos error:", err);
    errorResponse(res, 500, "Failed to fetch todos");
  }
};

const toggleTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!todo) {
      return errorResponse(res, 404, "Todo not found");
    }

    todo.completed = !todo.completed;
    await todo.save();

    res.json(todo);

  } catch (err) {
    console.error("Toggle todo error:", err);
    errorResponse(res, 500, "Toggle failed");
  }
};

const deleteTodo = async (req, res) => {
  try {
    const result = await Todo.deleteOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (result.deletedCount === 0) {
      return errorResponse(res, 404, "Todo not found");
    }

    res.json({ message: "Todo deleted" });
  } catch (err) {
    console.error("Delete todo error:", err);
    errorResponse(res, 500, "Delete failed");
  }
};

module.exports = {
  createTodo,
  getTodos,
  toggleTodo,
  deleteTodo
};
