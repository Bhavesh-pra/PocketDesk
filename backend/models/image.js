const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({

userId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

albumId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Album"
},

fileName:String,

filePath:String,

extractedText:String,

chunks:[
{
text:String,
embedding:[Number],
sourceType:String,
sourceName:String
}
],

size: {
  type: Number,
  default: 0
},

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Image",imageSchema);