const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
    },

    quantity: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    discription: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    img: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const ProductModel = mongoose.model("Product", ProductSchema);

module.exports = ProductModel;


