const UserModel = require("../model/User");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');


const getUser = async (req, res, next) => {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ message: "User is not Logged in" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(404).json({ message: "User not found" });
    } 

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = getUser;