const express = require("express");
const router = express.Router();
const Product = require("../model/Product")
const multer = require("multer");
const upload = require("../middleware/pictureMiddleware"); // Import multer middleware
const {getProducts, createProducts, like, unlike, liked, getProductsWithoutDiscription } = require("../controllers/productControllers")

router.get("/", getProducts)

router.post("/", upload.fields([
  { name: "img1", maxCount: 1 },
  { name: "img2", maxCount: 1 },
  { name: "img3", maxCount: 1 },
  { name: "img4", maxCount: 1 }
]), createProducts);

router.post("/like", like)
 
router.post("/unlike", unlike)

router.get("/liked", liked)

router.get("/wd", getProductsWithoutDiscription)


module.exports = router;