const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authenticate = (req, res, next) => {
  const token = req.headers["authorization"].split(" ")[1];
 
  if (!token) {
    return res.status(401).json("No token provided");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRETTOKEN);
    req.user = decoded;
    // console.log(token, decoded)
    next();
    
  } catch (error) {
    return res.status(401).json("Invalid or expired token");
  }
};

module.exports = authenticate;
