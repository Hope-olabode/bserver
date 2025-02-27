const express = require("express");
const router = express.Router();
const Product = require("../model/Product")
const {getProducts, createProducts, like, unlike, liked, getProductsWithoutDiscription } = require("../controllers/productControllers")

router.get("/", getProducts)

router.post("/", createProducts)

router.post("/like", like)
 
router.post("/unlike", unlike)

router.get("/liked", liked)

router.get("/wd", getProductsWithoutDiscription)


module.exports = router;