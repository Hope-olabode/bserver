const Product = require("../model/Product")
const UserModel = require("../model/User");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');

const getProducts = async (req, res) => {
  
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

// Create a new product (Authenticated)
const createProducts = async (req, res) => {
  const token = req.cookies.token; // Assumes the token is stored in a cookie named "token"
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using your secret key
    const product = await Product.create(req.body);
    res.status(200).json(product);
  } catch (error) {
    res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};


const like = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { productId } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Add product to likedProducts if not already liked
    if (!user.likedProducts.includes(productId)) {
      user.likedProducts.push(productId);
      await user.save();
    }

    res.status(200).json({ message: "Product liked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const unlike = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { productId } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove product from likedProducts
    user.likedProducts = user.likedProducts.filter(id => id.toString() !== productId);
    await user.save();

    res.status(200).json({ message: "Product unliked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const liked = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Populate only the `_id` field of likedProducts
    const user = await UserModel.findById(userId).populate({
      path: 'likedProducts',
      select: '_id', // Select only the _id field
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Map to extract only the ids from likedProducts
    const likedProductIds = user.likedProducts.map(product => product._id);

    res.status(200).json({ likedProducts: likedProductIds });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





module.exports = {
  getProducts,
  createProducts,
  like,
  unlike,
  liked,
}