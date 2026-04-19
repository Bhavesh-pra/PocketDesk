const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { validateTodo, validateObjectId } = require("../middleware/validationMiddleware");

const {
  createTodo,
  getTodos,
  toggleTodo,
  deleteTodo
} = require("../controllers/todoController");

router.post("/create", authMiddleware, validateTodo, createTodo);
router.get("/list", authMiddleware, getTodos);
router.patch("/:id/toggle", authMiddleware, validateObjectId("id"), toggleTodo);
router.delete("/:id", authMiddleware, validateObjectId("id"), deleteTodo);

module.exports = router;