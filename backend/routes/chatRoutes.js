const express = require("express");
const router = express.Router();

const { askQuestion, getConversationHistory, getChatList } =
require("../controllers/chatController");

const authMiddleware =
require("../middleware/authMiddleware");

router.post(
"/ask",
authMiddleware,
askQuestion
);

router.get(
"/history/:sessionId",
authMiddleware,
getConversationHistory
);

router.get(
"/list",
authMiddleware,
getChatList
);

module.exports = router;