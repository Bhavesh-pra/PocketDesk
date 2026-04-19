const jwt =
require("jsonwebtoken");
const User = require("../models/user");

const errorResponse = (res, status, message) => {
  return res.status(status).json({ error: message });
};

const authMiddleware =
async (req,res,next)=>{

try{

const authHeader =
req.headers.authorization;

if(!authHeader){
  return errorResponse(res, 401, "No token provided");
}

if(!authHeader.startsWith("Bearer ")){
  return errorResponse(res, 401, "Invalid token format");
}

const token =
authHeader.split(" ")[1];

if(!token){
  return errorResponse(res, 401, "No token provided");
}

const decoded =
jwt.verify(
token,
process.env.JWT_SECRET
);

const user = await User.findById(decoded.userId).select("isActive role");

if(!user){
  return errorResponse(res, 401, "User not found");
}

if(!user.isActive){
  return errorResponse(res, 403, "Account is deactivated");
}

req.userId = decoded.userId;
req.userRole = decoded.role;
req.userEmail = decoded.email;

next();

}catch(err){
  if(err.name === "TokenExpiredError"){
    return errorResponse(res, 401, "Token expired");
  }
  if(err.name === "JsonWebTokenError"){
    return errorResponse(res, 401, "Invalid token");
  }
  errorResponse(res, 401, "Authentication failed");
}

};

module.exports =
authMiddleware;
