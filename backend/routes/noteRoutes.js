const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

const storage = multer.diskStorage({
 destination:(req,file,cb)=>{
  cb(null,"uploads/notes");
 },
 filename:(req,file,cb)=>{
  cb(null,Date.now()+"-"+file.originalname);
 }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

const { uploadNote } = require("../controllers/noteController");

router.post(
 "/upload",
 authMiddleware,
 upload.single("note"),
 uploadNote
);

module.exports = router;