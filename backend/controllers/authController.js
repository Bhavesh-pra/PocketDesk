const User =
require("../models/user");

const bcrypt =
require("bcryptjs");

const jwt =
require("jsonwebtoken");

const generateAccessToken = (userId, role, email) => {
  return jwt.sign(
    { userId, role, email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (userId, version) => {
  return jwt.sign(
    { userId, version },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isStrongPassword = (password) => {
  if (password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasUpper && hasLower && hasNumber;
};

const errorResponse = (res, status, message) => {
  return res.status(status).json({ error: message });
};

// SIGNUP
const signup =
async (req,res)=>{

try{

const { email, password } =
req.body;

if(!email || !password){
  return errorResponse(res, 400, "Email and password are required");
}

const normalizedEmail = email.toLowerCase().trim();

if(!isValidEmail(normalizedEmail)){
  return errorResponse(res, 400, "Invalid email format");
}

if(!isStrongPassword(password)){
  return errorResponse(res, 400, "Password must be at least 8 characters with uppercase, lowercase, and number");
}

const existingUser =
await User.findOne({
email: normalizedEmail
});

if(existingUser){
  return errorResponse(res, 400, "User already exists");
}

const hashedPassword =
await bcrypt.hash(password,12);

const user =
await User.create({
  email: normalizedEmail,
  password: hashedPassword
});

const accessToken = generateAccessToken(user._id, user.role, user.email);
const refreshToken = generateRefreshToken(user._id, user.refreshTokenVersion);

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

res.status(201).json({
  accessToken,
  email: user.email,
  role: user.role
});


}catch(err){
  console.error("Signup error:", err);
  errorResponse(res, 500, "Signup failed");
}

};



// LOGIN
const login =
async (req,res)=>{

try{

const { email, password } =
req.body;


if(!email || !password){
  return errorResponse(res, 400, "Email and password are required");
}

const normalizedEmail = email.toLowerCase().trim();

const user =
await User.findOne({
email: normalizedEmail
});

if(!user){
  return errorResponse(res, 401, "Invalid credentials");
}

if(!user.isActive){
  return errorResponse(res, 403, "Account is deactivated");
}

const valid =
await bcrypt.compare(
password,
user.password
);

if(!valid){
  return errorResponse(res, 401, "Invalid credentials");
}

user.lastLogin = new Date();
await user.save();

const accessToken = generateAccessToken(user._id, user.role, user.email);
const refreshToken = generateRefreshToken(user._id, user.refreshTokenVersion);

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

res.json({
  accessToken,
  email: user.email,
  role: user.role
});


}catch(err){
  console.error("Login error:", err);
  errorResponse(res, 500, "Login failed");
}

};

const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return errorResponse(res, 401, "No refresh token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("email role refreshTokenVersion isActive");

    if (!user) {
      return errorResponse(res, 401, "User not found");
    }

    if (!user.isActive) {
      return errorResponse(res, 403, "Account is deactivated");
    }

    if (user.refreshTokenVersion !== decoded.version) {
      return errorResponse(res, 401, "Refresh token invalidated");
    }

    const newVersion = user.refreshTokenVersion + 1;
    user.refreshTokenVersion = newVersion;
    await user.save();

    const accessToken = generateAccessToken(user._id, user.role, user.email);
    const newRefreshToken = generateRefreshToken(user._id, newVersion);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken, email: user.email || "", role: user.role || "user" });

  } catch (err) {
    console.error("Refresh error:", err);
    errorResponse(res, 401, "Invalid refresh token");
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await User.findByIdAndUpdate(decoded.userId, { $inc: { refreshTokenVersion: 1 } });
    }
  } catch (err) {
    // Ignore errors
  }
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
};

const crypto = require("crypto");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return errorResponse(res, 400, "Email is required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      return res.status(200).json({ message: "If an account exists, a reset email will be sent" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

    const message = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link is valid for 10 minutes.</p>
    `;

    try {
      await resend.emails.send({
        from: "PocketDesk <onboarding@resend.dev>",
        to: user.email,
        subject: "Password Reset Token",
        html: message,
      });
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
      return errorResponse(res, 500, "Failed to send email");
    }

    res.status(200).json({ message: "If an account exists, a reset email will be sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    errorResponse(res, 500, "Failed to process request");
  }
};

const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(res, 400, "Invalid or expired token");
    }

    const { password } = req.body;
    
    if (!password) {
      return errorResponse(res, 400, "Please provide a new password");
    }

    if (!isStrongPassword(password)) {
      return errorResponse(res, 400, "Password must be at least 8 characters with uppercase, lowercase, and number");
    }

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return errorResponse(res, 400, "New password cannot be the same as current password");
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokenVersion += 1;
    await user.save();

    const accessToken = generateAccessToken(user._id, user.role, user.email);
    const refreshToken = generateRefreshToken(user._id, user.refreshTokenVersion);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ accessToken, email: user.email, role: user.role, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    errorResponse(res, 500, "Failed to reset password");
  }
};

module.exports = {

signup,
login,
refresh,
logout,
forgotPassword,
resetPassword

};
