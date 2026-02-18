const jwt = require("jsonwebtoken");

const verifyAccessToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      throw new Error("Access Token is Required");
    }

    const decodedDataFromToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    req.user = decodedDataFromToken;
    next(); // 👈 correct usage
  } catch (error) {
    res.status(401).json({
      error: true,
      message: error.message,
    });
  }
};

module.exports = verifyAccessToken;
