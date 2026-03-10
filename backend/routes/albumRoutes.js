const express = require("express");
const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {
createAlbum,
getAlbums,
deleteAlbum
} = require("../controllers/albumController");


router.post(
"/create",
authMiddleware,
createAlbum
);

router.get(
"/list",
authMiddleware,
getAlbums
);

router.delete(
"/:id",
authMiddleware,
deleteAlbum
);

module.exports = router;