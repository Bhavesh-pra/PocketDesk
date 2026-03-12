const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({

userId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

fileName:String,

filePath:String,

text:String,

chunks:[{
text:String,
embedding:[Number]
}],

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Note",noteSchema);