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
const context = `
Image extracted text:

${imageText}
`;


// ask AI
const answer =
await askAI(context,question);


// save conversation
let conversation =
await Conversation.findOne({
sessionId
});

if(!conversation){

conversation = new Conversation({

sessionId,
messages:[]

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