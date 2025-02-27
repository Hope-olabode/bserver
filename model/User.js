const  mongoose  = require("mongoose");

const UserSchema = new mongoose.Schema({
  Email:{ type: String, required: true, unique: true },
  Password:{ type: String, required: true, unique: true },
  Full_Name:{ type: String, default: "" },
  Phone_No:{ type: String, default: "" },
  Brand_Name:{ type: String, default: "" },
  Location:{ type: String, default: "" },
  isDetailsFilled: { type: Boolean, default: false },
  resetOtp: { type: String, default: ''},
  resetOtpExpireAt: { type: Number, default: 0},
  verifyOtp: { type: String, default: ''},
  verifyOtpExpiresAt: { type: Number, default: 0},
  isAccountVerified: { type: Boolean, default: false},
  Profile_Image: { type: String, default: "" },
  likedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 },
    },
  ],
})

const UserModel = mongoose.model("users", UserSchema)

module.exports = UserModel;


