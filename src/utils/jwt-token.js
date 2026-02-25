const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id,
      role: user.role,  
    },
     process.env.ACCESS_TOKEN_SECRET, 
     {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
  });
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
    )
}
module.exports={generateAccessToken,generateRefreshToken};
