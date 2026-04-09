const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/rbacMiddleware");
const { getUsers, toggleUserActive, getMetrics } = require("../controllers/adminController");

// Apply auth and admin check to all routes
router.use(authMiddleware, requireAdmin);

router.get("/users", getUsers);
router.patch("/users/:id/toggle", toggleUserActive);
router.get("/metrics", getMetrics);

module.exports = router;
