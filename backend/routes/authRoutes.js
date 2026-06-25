const express =
require("express");

const router =
express.Router();

console.log("[AUTH] authRoutes loaded");

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

console.log("[AUTH] POST /refresh registered");
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);

router.get("/debug", (req, res) => {
  res.json({
    routesLoaded: true,
    loginRoute: true,
    refreshRoute: true
  });
});

router.post(
"/signup",
validateSignup,
signup
);

console.log("[AUTH] POST /login registered");
router.post(
"/login",
validateLogin,
login
);


module.exports =
router;
