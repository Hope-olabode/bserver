const express = require("express");
const router = express.Router();
const Product = require("../model/User")
const {signUp, logIn, isLogin, additional, isDetailsFilled, google,  emailCheck, verifyResetOtp, resetPassword } = require("../controllers/authControllers");


router.post("/signup", signUp)

router.post("/login", logIn)

router.post("/next", additional)

router.get("/isLogin", isLogin)

router.get("/isDetailsFilled", isDetailsFilled)

router.post("/google", google);

router.post("/email", emailCheck);

router.post("/otp", verifyResetOtp);

router.post("/reset", resetPassword);


module.exports = router;