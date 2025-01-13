const  mongoose  = require("mongoose");

const UserSchema = new mongoose.Schema({
  Email:{ type: String, required: true, unique: true },
  Password:{ type: String, required: true, unique: true },
  Full_Name:{ type: String, default: "" },
  Phone_No:{ type: String, default: "" },
  Brand_Name:{ type: String, default: "" },
  Location:{ type: String, default: "" },
  isDetailsFilled: { type: Boolean, default: false },
  Profile_Image: { type: String, default: "" },
  likedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
})

const UserModel = mongoose.model("users", UserSchema)

module.exports = UserModel;


