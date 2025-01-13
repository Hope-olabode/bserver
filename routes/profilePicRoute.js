const express = require("express");
const router = express.Router();
const { updateProfile } = require("../controllers/profilePicController")
const upload = require("../middleware/pictureMiddleware"); // Import multer middleware


router.post('/', upload.single('image'), updateProfile);


module.exports = router;