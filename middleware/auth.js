const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Middleware to verify the JWT token
const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (token == "null") {
    console.log("if ******************8");
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded,"********************************* decoded")

    const a = await User.findById(decoded.userId);
    console.log(a,"*****************************88888a")
    console.log(typeof (a));

    // Attach the userId to the request object
    req.user = decoded.userId; // This comes from the payload of the JWT
    

    if(a===null){
      return res.status(401).json({ msg: "User Not Exist In DataBase" });
      // console.log("null ****************************** this is null ")
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authMiddleware;
