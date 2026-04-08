const Todo = require("../models/todo");
const reminderQueue = require("../queues/reminderQueue");

// CREATE TODO
const createTodo = async (req, res) => {
  try {
    const { text, scheduledTime, priority } = req.body;

    if (!text || !scheduledTime) {
      return res.status(400).json({
        message: "Text and scheduledTime required"
      });
    }

    const todo = await Todo.create({
      userId: req.userId,
      text,
      scheduledTime,
      priority: priority || "medium"
    });

    // ⏰ Schedule job
    const delay =
      new Date(scheduledTime).getTime() - Date.now() - (60 * 60 * 1000);

    if (delay > 0) {
      await reminderQueue.add(
        "send-reminder",
        { todoId: todo._id },
        { delay }
      );
    }

    res.json(todo);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Create failed" });
  }
};

// GET TODOS
const getTodos = async (req, res) => {
  const todos = await Todo.find({
    userId: req.userId
  }).sort({ scheduledTime: 1 });

  res.json(todos);
};

// TOGGLE COMPLETE
const toggleTodo = async (req, res) => {
  try {
    console.log("🔄 Toggle request:", req.params.id);

    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!todo) {
      console.log("❌ Todo not found");
      return res.status(404).json({
        message: "Not found"
      });
    }

    console.log("Before:", todo.completed);

    todo.completed = !todo.completed;
    await todo.save();

    console.log("After:", todo.completed);

    res.json(todo);

  } catch (err) {
    console.log("Toggle error:", err);
    res.status(500).json({ message: "Toggle failed" });
  }
};

// DELETE
const deleteTodo = async (req, res) => {
  await Todo.deleteOne({
    _id: req.params.id,
    userId: req.userId
  });

  res.json({ message: "Deleted" });
};

module.exports = {
  createTodo,
  getTodos,
  toggleTodo,
  deleteTodo
};