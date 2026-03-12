const express = require("express");
const multer = require("multer");

const { uploadNote } =
require("../controllers/noteController");

const authMiddleware =
require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
dest:"uploads/notes/"
});

router.post(
"/upload",
authMiddleware,
upload.single("note"),
uploadNote
);

module.exports = router;