const UserModel = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');





const addToCart =  async (req, res) => {
  const data = req.body;
  console.log(req.body)
  const _id = data._id
  const name = data.name
  const price = data.price;
  const quantity = data.quantity;
  
  try {
    const existingItem = req.user.cart.find(
      (item) => item._id.toString() === data._id
    );
    console.log(existingItem)
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      req.user.cart.push({ _id, name, price, quantity });
    }

    await req.user.save();
    res.status(200).json(req.user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getCart = async (req, res) => {
  try {
    res.status(200).json(req.user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteProductFromCart = async (req, res) => {

  try {
    req.user.cart = req.user.cart.filter(
      (item) => item._id.toString() !== req.params.productId
    );
    await req.user.save();
    res.status(200).json(req.user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const UpdateCartProduct = async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  try {
    // Convert productId to ObjectId
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Find the cart item
    const cartItem = req.user.cart.find((item) =>
      item._id.equals(productObjectId)
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Update the quantity
    cartItem.quantity = quantity;

    // Save the updated user document
    await req.user.save();

    // Send the updated cart as the response
    return res.status(200).json(req.user.cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



module.exports = {
  addToCart,
  getCart,
  deleteProductFromCart,
  UpdateCartProduct
};