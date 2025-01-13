const UserModel = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');



const signUp = async (req, res) => {
  const { Email, Password, confirmPassword } = req.body;

  if (Password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    // Check if the user already exists
    const existingUser = await UserModel.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(Password, 10);
    const newUser = new UserModel({
      Email,
      Password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // Generate a new token
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Clear any existing token
    res.clearCookie('token');

    // Set the new token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Enable secure in production
      sameSite: process.env.NODE_ENV === "production" ? "Lax" : "strict", // Adjust if necessary (e.g., 'Lax' for cross-site cookies)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup Error:', error);
    return res
      .status(500)
      .json({ message: 'An error occurred while registering' });
  }
};


const logIn = async (req, res) => {
  try {
    const { Email, Password, } = req.body;
    console.log(Email)
    const User = await UserModel.findOne({ Email });

    if (!User) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(Password, User.Password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    const token = jwt.sign({ id: User._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookie with the token
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "An error occurred. Please try again later." });
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
      const user = await UserModel.findById(decoded.id)/* .select('Full_Name').lean(); */
      console.log('User:', user); // Log user details from the database

      if (user) {
        return res.status(200).json({ loggedIn: true, user: user});
      } else {
        /* console.log('User not found or Full_Name missing'); */
        return res.status(200).json({ loggedIn: false });
      }
    }
  } catch (err) {
    // console.error('JWT Verification Error:', err.message); // Log JWT errors
    return res.status(200).json({ loggedIn: false });
  }
}


const additional = async (req, res) => {
  console.log('Cookies:', req.cookies);
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
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);

    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      // console.log('Invalid ObjectId:', decoded.id);
      return res.status(400).json({ message: 'Invalid User ID' });
    }

    const user = await UserModel.findById(decoded.id)
      .select('isDetailsFilled')
      .lean();

    // console.log('User:', user);

    if (!user) {
      console.log('User not found in the database');
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ isDetailsFilled: user.isDetailsFilled });
  } catch (err) {
    console.error('Error:', err.name, err.message);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    res.status(500).json({ message: 'Internal Server Error' });
  }
};



module.exports = {
  signUp,
  logIn,
  isLogin,
  additional,
  isDetailsFilled
};
