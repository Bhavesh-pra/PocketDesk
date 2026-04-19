const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({

destination: function (req, file, cb) {
cb(null, "uploads/images");
},

filename: function (req, file, cb) {

const uniqueName =
Date.now() + "-" + file.originalname;

cb(null, uniqueName);

}

});

const uploadImage = multer({
storage,
limits: { fileSize: 50 * 1024 * 1024 },
fileFilter: (req,file,cb)=>{

if(file.mimetype.startsWith("image/")){
cb(null,true);
}else{
cb(new Error("Only images allowed"),false);
}

}
});

module.exports = uploadImage;