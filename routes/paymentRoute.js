const express = require("express");
const router = express.Router();

const { initializeTransaction } = require("../controllers/paymentControllers")



router.post("/initialize-transaction", initializeTransaction)




module.exports = router;