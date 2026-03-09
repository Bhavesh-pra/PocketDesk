const User =
require("../models/user");

const bcrypt =
require("bcryptjs");

const jwt =
require("jsonwebtoken");


// SIGNUP

const signup =
async (req,res)=>{

try{

const { email, password } =
req.body;

if(!email || !password){

return res.status(400).json({
message:"Email and password required"
});

}


// Check existing user

const existingUser =
await User.findOne({
email
});

if(existingUser){

return res.status(400).json({
message:"User already exists"
});

}


// Hash password

const hashedPassword =
await bcrypt.hash(password,10);


// Save user

const user =
await User.create({

email,
password:hashedPassword

});


// Create token

const token =
jwt.sign(

{ userId:user._id },

process.env.JWT_SECRET,

{ expiresIn:"7d" }

);


res.json({

token

});


}catch(err){

console.log(err);

res.status(500).json({
message:"Signup error"
});

}

};



// LOGIN

const login =
async (req,res)=>{

try{

const { email, password } =
req.body;


const user =
await User.findOne({
email
});

if(!user){

return res.status(400).json({
message:"User not found"
});

}


// Compare password

const valid =
await bcrypt.compare(
password,
user.password
);

if(!valid){

return res.status(400).json({
message:"Wrong password"
});

}


// Create token

const token =
jwt.sign(

{ userId:user._id },

process.env.JWT_SECRET,

{ expiresIn:"7d" }

);


res.json({
token
});


}catch(err){

console.log(err);

res.status(500).json({
message:"Login error"
});

}

};


module.exports = {

signup,
login

};