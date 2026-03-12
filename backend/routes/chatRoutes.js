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

const multer = require("multer");

const storage =
multer.diskStorage({

destination:(req,file,cb)=>{

cb(null,"uploads/chatImages/");

},

filename:(req,file,cb)=>{

cb(null,
Date.now()+"-"+file.originalname
);

}

});

const upload = multer({ storage });

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