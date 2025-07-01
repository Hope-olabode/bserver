const Product = require("../model/Product")
const UserModel = require("../model/User");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');
const path = require('path');
const fs = require("fs");
const cloudinary = require('../config/cloudinaryConfig'); // Import Cloudinary config

const getProducts = async (req, res) => {

  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

const getProductsWithoutDiscription = async (req, res) => {

  try {
    const products = await Product.find({}, { discription: 0 });
    res.status(200).json(products);
  } catch (error) {
    res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

// Create a new product (Authenticated)
const createProducts = async (req, res) => {
  const token = req.cookies.token;

  console.log(token)

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)
    if (decoded.Role !== "Admin") {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    const imageUrls = {};

    const imageUploadPromises = [];

    for (let i = 1; i <= 4; i++) {
      const file = req.files?.[`img${i}`]?.[0];
      if (file) {
        const filePath = path.resolve(file.path);

        imageUploadPromises.push(
          cloudinary.uploader.upload(filePath, { folder: "product_images" })
            .then(uploadRes => {
              imageUrls[`img${i}`] = uploadRes.secure_url;
              fs.unlinkSync(file.path);
            })
        );
      }
    }

    await Promise.all(imageUploadPromises); // wait for all uploads to complete

    const product = await Product.create({
      name: req.body.Name,
      quantity: req.body.Quantity,
      price: req.body.Price,
      category: req.body.Category,
      discription: req.body.Discription,
      ...imageUrls, // Spread in { img1: "...", img2: "...", ... }
    });

    res.status(200).json(product);
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const like = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized! you are not loged in" });

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
  getProductsWithoutDiscription,
}