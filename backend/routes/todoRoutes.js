const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createTodo,
  getTodos,
  toggleTodo,
  deleteTodo
} = require("../controllers/todoController");

router.post("/create", authMiddleware, createTodo);
router.get("/list", authMiddleware, getTodos);
router.patch("/:id/toggle", authMiddleware, toggleTodo);
router.delete("/:id", authMiddleware, deleteTodo);

module.exports = router;