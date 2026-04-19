const express =
require("express");

const router =
express.Router();

const {
  signup,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

const {
  validateSignup,
  validateLogin
} = require("../middleware/validationMiddleware");

router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);

router.post(
"/signup",
validateSignup,
signup
);

router.post(
"/login",
validateLogin,
login
);


module.exports =
router;