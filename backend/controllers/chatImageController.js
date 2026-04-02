const fs = require("fs");

const { extractTextFromImage } =
require("../services/ocrService");

const { askAI } =
require("../services/aiService");

const Conversation =
require("../models/conversation");


const chatImage = async (req,res)=>{

try{

const question = req.body.question;

const sessionId = req.body.sessionId;

const imagePath = req.file.path;


// OCR text
const imageText =
await extractTextFromImage(imagePath);


// build context
let context = "";

if (!imageText || imageText.trim().length < 10) {
  context = "The image text could not be extracted clearly. Try to interpret the image.";
} else {
  context = `
Image extracted text:

${imageText}
`;
}

console.log("OCR TEXT LENGTH:", imageText.length);


// ask AI
const answer =
await askAI(context,question);


// save conversation
let conversation = await Conversation.findOne({
  sessionId,
  userId: req.userId   // 🔥 ADD THIS
});

if (!conversation) {

  conversation = new Conversation({
    userId: req.userId,   // 🔥 ADD THIS
    sessionId,
    messages: []
  });

}

conversation.messages.push({
role:"User",
content:question
});

conversation.messages.push({
role:"AI",
content:answer
});

await conversation.save();


res.json({
answer
});


}catch(err){

console.log(err);

res.status(500).json({
message:"Image chat error"
});

}

};

module.exports = {
chatImage
};