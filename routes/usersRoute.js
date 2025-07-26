const express = require("express");
const router = express.Router();
const {getUsers, ping } = require("../controllers/usersController")

router.get("/getuser", getUsers);
router.post("/ping", ping);


module.exports = router;