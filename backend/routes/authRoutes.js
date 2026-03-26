const express =
require("express");

const router =
express.Router();

const {
  signup,
  login,
  refresh,
  logout
} = require("../controllers/authController");

router.post("/refresh", refresh);
router.post("/logout", logout);

router.post(
"/signup",
signup
);

router.post(
"/login",
login
);


module.exports =
router;