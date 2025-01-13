const jwt = require('jsonwebtoken');
const UserModel = require('../model/User');
const cloudinary = require('../config/cloudinaryConfig'); // Import Cloudinary config
const fs = require('fs');
const path = require('path');

const updateProfile = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { Full_Name, Brand_Name, Phone_No, Email, Profile_Image } = req.body;

    // Fetch the current user to check the existing Profile_Image
    const currentUser = await UserModel.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let profileImageUrl = currentUser.Profile_Image; // Start with the existing profile image

    // Process file upload
    if (req.file) {
      const filePath = path.resolve(req.file.path);
      console.log("File path for upload:", filePath);

      

      // Upload the new image to Cloudinary
      const uploadedResponse = await cloudinary.uploader.upload(filePath, {
        folder: `user_profiles/${userId}`,
        public_id: `profile_${userId}`,
      });

      profileImageUrl = uploadedResponse.secure_url;

      // Remove the temporary file
      fs.unlinkSync(req.file.path);
    }

    // If Profile_Image is provided in the body and is a valid string
    if (Profile_Image && typeof Profile_Image === 'string') {
      profileImageUrl = Profile_Image;
    }

    // Prepare update data
    const updateData = {
      Full_Name,
      Brand_Name,
      Phone_No,
      Email,
      Profile_Image: profileImageUrl, // Ensure this is always a string
      isDetailsFilled: true,
    };

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { updateProfile };

