const jwt =
require("jsonwebtoken");


const authMiddleware =
(req,res,next)=>{

try{

const authHeader =
req.headers.authorization;

if(!authHeader){

return res.status(401).json({
message:"No token provided"
});

}


const token =
authHeader.split(" ")[1];


const decoded =
jwt.verify(
token,
process.env.JWT_SECRET
);


req.userId = decoded.userId;
req.userRole = decoded.role;
req.userEmail = decoded.email;


next();

}catch(err){

res.status(401).json({
message:"Invalid token"
});

}

};


module.exports =
authMiddleware;