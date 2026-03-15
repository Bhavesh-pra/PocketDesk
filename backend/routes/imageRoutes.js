const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const uploadImage = require("../middleware/uploadImage");

const { uploadImage:upload, getImages, deleteImage } =
require("../controllers/imageController");

router.post(
"/upload/:albumId",
authMiddleware,
uploadImage.single("image"),
upload
);

router.get(
"/list/:albumId",
authMiddleware,
getImages
);

router.delete(
"/:id",
authMiddleware,
deleteImage
);

module.exports = router;