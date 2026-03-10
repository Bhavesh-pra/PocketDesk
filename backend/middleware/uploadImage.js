const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/images");
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s/g, "_");

    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {

  const allowed = ["image/png","image/jpeg","image/jpg","image/webp"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid image type"), false);
  }

};

const uploadImage = multer({
  storage,
  fileFilter
});

module.exports = uploadImage;