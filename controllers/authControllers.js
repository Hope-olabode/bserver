const UserModel = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const transporter = require("../config/nodemailer.js");
const {
  Welcome_Email_Template,
  VERIFICATION_EMAIL_TEMPLATE,
  RESET_EMAIL_TEMPLATE,
} = require("../config/emailtemplate.js");
const dotenv = require("dotenv");

// Load environment variables in this file
dotenv.config();

const signUp = async (req, res) => {
  const { Email, Password, confirmPassword } = req.body;

  if (Password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // Check if the user already exists
    const existingUser = await UserModel.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(Password, 10);
    const newUser = new UserModel({
      Email,
      Password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // Generate a new token
    const token = jwt.sign({ id: savedUser._id, }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Clear any existing token
    res.clearCookie("token");

    // Set the new token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Cookies sent only over HTTPS in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const otp = String(Math.floor(1000 + Math.random() * 9000));
    newUser.verifyOtp = otp;
    newUser.verifyOtpExpiresAt = Date.now() + 15 * 60 * 1000;

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: newUser.Email,
      subject: "Email Verify OTP",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", otp),
      category: "Reset Email Verification",
    };
    await newUser.save();
    await transporter.sendMail(mailOptions);
    
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup Error:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while registering" });
  }
};

const logIn = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    console.log(Email);
    const User = await UserModel.findOne({ Email });
    console.log(User);

    if (!User) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(Password, User.Password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    const token = jwt.sign({ id: User._id, Role: User.Role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookie with the token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Cookies sent only over HTTPS in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login Error:", error.message);
    res
      .status(500)
      .json({ message: "An error occurred. Please try again later." });
  }
};

const isLogin = async (req, res) => {
  // console.log('Cookies:', req.cookies); // Check if cookies are being received

  const token = req.cookies.token;

  if (!token) {
    return res.status(200).json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('Decoded Token:', decoded); // Log the decoded token

    if (decoded) {
      const user = await UserModel.findById(
        decoded.id
      ); /* .select('Full_Name').lean(); */
      console.log("User:", user); // Log user details from the database

      if (user) {
        return res.status(200).json({ loggedIn: true, user: user });
      } else {
        /* console.log('User not found or Full_Name missing'); */
        return res.status(200).json({ loggedIn: false });
      }
    }
  } catch (err) {
    // console.error('JWT Verification Error:', err.message); // Log JWT errors
    return res.status(200).json({ loggedIn: false });
  }
};

const additional = async (req, res) => {
  console.log("Cookies:", req.cookies);
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { Full_Name, Brand_Name, Phone_No, Location } = req.body;

    // Update user details and set isDetailsFilled to true
    const updatedUser = await UserModel.findByIdAndUpdate(
      decoded.id,
      { Full_Name, Brand_Name, Phone_No, Location, isDetailsFilled: true },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Details updated successfully" });
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const isDetailsFilled = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    // console.log('Token missing');
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      // console.log('Invalid ObjectId:', decoded.id);
      return res.status(400).json({ message: "Invalid User ID" });
    }

    const user = await UserModel.findById(decoded.id)
      .select("isDetailsFilled")
      .lean();

    // console.log('User:', user);

    if (!user) {
      console.log("User not found in the database");
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ isDetailsFilled: user.isDetailsFilled });
  } catch (err) {
    console.error("Error:", err.name, err.message);

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

const google = async (req, res) => {
  console.log(req.body);
  const { Name, Email, Profile_Image } = req.body;
  console.log(Email);
  try {
    const user = await UserModel.findOne({ Email });
    console.log(user);
    if (user) {
      console.log(user._id);
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      console.log(1);
      res.status(200).json({ message: "Login successful" });
    } else {
      const generatedPassword =
        Math.round().toString(36).slice(-8) +
        Math.round().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);
      const newuser = new UserModel({
        Name,
        Email,
        Profile_Image,
        Password: hashedPassword,
      });
      await newuser.save();

      const token = jwt.sign({ id: newuser._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Enable secure in production
        sameSite: process.env.NODE_ENV === "production" ? "Lax" : "strict", // Adjust if necessary (e.g., 'Lax' for cross-site cookies)
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.status(200).json({ message: "Login successful" });
    }
  } catch (error) {
    console.log(error);
  }
};

const emailCheck = async (req, res) => {
  const { Email } = req.body;
  if (!Email) {
    return res.status(404).json({ message: "Email required" });
  }
  console.log(Email);
  try {
    const user = await UserModel.findOne({ Email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email" });
    }
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.Email,
      subject: "Password Reset OTP",
      html: RESET_EMAIL_TEMPLATE.replace("{verificationCode}", otp),
      category: "Reset Email Verification",
    };
    await user.save();
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Reset OTP sent to your email" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


  // ,
  // "name": "Tshirt (285 gsm)",
  // "Quantity": "1000",
  // "price": "22000",
  // "discription":	"-",
  // "category": "T-Shirts",
	//  "img1" : "",
  // "img2" : "",
  // "img3" : "",
  // "img4" : "",
  // "createdAt" : "2025-07-17T10:16:33.325+00:00",
  // "updatedAt" : "2025-07-17T010:16:33.325+00:00",
  // "__v": 0
  

const verifyResetOtp = async (req, res) => {
  console.log(req.body);
  const { Email, otp } = req.body;
  if (!Email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required." });
  }

  try {
    const user = await UserModel.findOne({ Email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Check if the OTP has expired
    if (Date.now() > user.resetOtpExpireAt) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired." });
    }

    // Check if the OTP is valid
    if (user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    // If OTP is verified successfully, optionally clear the OTP and expiration fields
    user.resetOtp = undefined;
    user.resetOtpExpireAt = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { Email, newPassword } = req.body;
  console.log(req.body);
  if (!Email || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Email and NewPassword are required" });
  }
  try {
    const user = await UserModel.findOne({ Email });
    console.log(user)
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found in DB" });
    }

    // If the OTP field still exists (i.e. not cleared), it means the OTP wasn't verified.
    if (user.resetOtp) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has not been verified yet" });
    }

    // Optional: You might also check if the OTP expired field is still set (if your logic requires it)
    if (user.resetOtpExpireAt && user.resetOtpExpireAt > Date.now()) {
      return res
        .status(400)
        .json({
          success: false,
          message: "OTP is still active. Verify OTP before resetting password.",
        });
    }

    // Proceed with resetting the password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.Password = hashedPassword;

    // Clear any OTP-related fields just to be safe
    user.resetOtp = undefined;
    user.resetOtpExpireAt = undefined;

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const token = req.cookies.token;
  const { otp } = req.body;
  if (!otp)
    return res
      .status(400)
      .json({ success: false, message: "OTP is required." });

  if (!token)
    return res
      .status(401)
      .json({ message: "Unauthorized! you are not loged in" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if the OTP has expired
    if (Date.now() > user.verifyOtpExpiresAt) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired." });
    }

    // Check if the OTP is valid
    if (user.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    user.verifyOtp = undefined;
    user.verifyOtpExpiresAt = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  signUp,
  logIn,
  isLogin,
  additional,
  isDetailsFilled,
  google,
  emailCheck,
  verifyResetOtp,
  resetPassword,
  verifyEmail,
};
