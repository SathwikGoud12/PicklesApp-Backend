const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt-token");
const cookie = require("cookie-parser");

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      throw new Error("All Fields are Required..");
    }
    const existingUserWithEmail = await User.exists({ email: req.body.email });
    console.log(existingUserWithEmail);
    if (existingUserWithEmail?._id) {
      throw new Error("User with this email already exists..");
    }
    const existingUserWithFullName = await User.exists({
      fullName: req.body.fullName,
    });
    console.log(existingUserWithFullName);
    if (existingUserWithFullName?._id) {
      throw new Error("User with this fullName already exists..");
    }
    console.log("REGISTER API HIT");

    const newUser = await User.create({
      fullName,
      email,
      password,
    });
   
    console.log("New User Created:", newUser);
    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(400).json({
      error: true,
      message: error.message,
    });
  }
};

const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      throw new Error("Email is Required");
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new Error("User does not exist with this email");
    }

    const samePassword = await bcrypt.compare(password, existingUser.password);

    if (!samePassword) {
      throw new Error("Password is incorrect");
    }

    const accessToken = generateAccessToken(existingUser._id);

    const refreshToken = generateRefreshToken(existingUser._id);

    existingUser.refreshToken = refreshToken;

    await existingUser.save();

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };

    res
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .status(200)
      .json({
        success: true,
        message: "User Logged In Successfully",
        accessToken,
        user: {
          id: existingUser._id,
          fullName: existingUser.fullName,
          email: existingUser.email,
        },
      });
  } catch (error) {
    res.status(400).json({
      error: true,
      message: error.message,
    });
  }
};
async function logOutUser(req, res) {
  try {
    const { userId } = req.user;
    console.log("UserId from req.user in logOutUser:", userId);
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.status(200).json({
      success: true,
      message: "User Logged Out Successfully",
    });
  } catch (error) {
    console.error("Error in logOutUser:", error);
    res.status(400).json({
      error: true,
      message: "Internal Server Error",
    });
  }
}


module.exports={registerUser,LoginUser,logOutUser}