const express = require("express");
const router = express.Router();
const Product = require("../model/User")
const {signUp, logIn, isLogin, additional, isDetailsFilled } = require("../controllers/authControllers")

router.post("/signup", signUp)

router.post("/login", logIn)

router.post("/next", additional)

router.get("/isLogin", isLogin)

router.get("/isDetailsFilled", isDetailsFilled)


module.exports = router;