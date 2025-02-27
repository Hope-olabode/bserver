const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  deleteProductFromCart,
  UpdateCartProduct,
} = require("../controllers/cartControllers");
const getUser = require("../middleware/getUser"); // Import multer middleware

router.post("/", getUser, addToCart);
router.get("/", getUser, getCart);
router.delete("/:productId", getUser, deleteProductFromCart);
router.put("/:productId", getUser, UpdateCartProduct);

module.exports = router;
