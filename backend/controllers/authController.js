const User =
require("../models/user");

const bcrypt =
require("bcryptjs");

const jwt =
require("jsonwebtoken");

const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

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

const accessToken = generateAccessToken(user._id);
const refreshToken = generateRefreshToken(user._id);

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: false, // change to true in production
  sameSite: "strict"
});

res.json({
  accessToken
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

const accessToken = generateAccessToken(user._id);
const refreshToken = generateRefreshToken(user._id);

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: false,
  sameSite: "strict"
});

res.json({
  accessToken
});


}catch(err){

console.log(err);

res.status(500).json({
message:"Login error"
});

}

};

const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const accessToken = generateAccessToken(decoded.userId);

    res.json({ accessToken });

  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

const logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
};

module.exports = {

signup,
login,
refresh,
logout

};