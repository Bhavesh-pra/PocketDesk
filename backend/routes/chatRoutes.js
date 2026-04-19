const express = require("express");
const router = express.Router();

const { askQuestion, getConversationHistory, getChatList, deleteChat } =
require("../controllers/chatController");

const authMiddleware =
require("../middleware/authMiddleware");

const { chatImage } =
require("../controllers/chatImageController");

const { chatPdf } =
require("../controllers/chatPdfController");

const { validateChat } = require("../middleware/validationMiddleware");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = "uploads/chatImages/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage =
multer.diskStorage({

destination:(req,file,cb)=>{

cb(null,"uploads/chatImages/");

},

filename:(req,file,cb)=>{

cb(null,
Date.now()+"-"+file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")
);

}

});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "image") {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed"), false);
      }
    }
    if (file.fieldname === "pdf") {
      const ext = path.extname(file.originalname).toLowerCase();
      if (ext !== ".pdf") {
        return cb(new Error("Only PDF files are allowed"), false);
      }
    }
    cb(null, true);
  }
});



router.post(
"/ask",
authMiddleware,
validateChat,
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

router.post(
"/image",
authMiddleware,
upload.single("image"),
chatImage
);

router.delete(
"/:sessionId",
authMiddleware,
deleteChat
);

router.post(
"/pdf",
authMiddleware,
upload.single("pdf"),
chatPdf
);

module.exports = router;