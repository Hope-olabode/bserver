const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const UserModel = require("./model/User");
const Product = require("./model/Product");
const productRoute = require("./routes/productRoute");
const authRoute = require("./routes/authRoute");
const profilePicRoute = require("./routes/profilePicRoute");
const cookieParser = require("cookie-parser");


dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173", // Local development
  "https://br-8l5l.vercel.app", // Production frontend
];

app.use(cors({ origin: allowedOrigins, credentials: true }));

// routes
app.use("/api/products", productRoute);
app.use("/auth", authRoute);
app.use("/api/profilePic", profilePicRoute);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("connected to mongoDB"))
  .catch((err) => console.log("failed to conect to mongoDB", err));

app.listen(PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});

app.get("/giveme", async (req, res) => {
  res.send("you will show in postman");
});

/* app.post("/api/products", async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(200).json(product)
  } catch (error) {
    res.status(500).json({message: error.message})
  }
})

app.get("/api/products", async (req, res) => {
  try {
    const product = await Product.find({})
    res.status(200).json(product)
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}) */

/* app.post('/auth/signup', async(req, res)=> {
  try {
    const data = req.body
    console.log(data)
    const existingUser = await UserModel.findOne({email:data.email});
    console.log(existingUser)
    if (existingUser) {
      return res.status(400).json({error: "Email already exists"})
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = {
      Firstname: data.name,
      Lastname: data.name2,
      email: data.email,
      password: hashedPassword
    }
    const realNewUser = new UserModel(newUser)
    const savedUser = await realNewUser.save()
    res.status(201).json(savedUser)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
  
})


app.post('/auth/login', async(req, res)=> {
  try{
    const {email, password} = req.body
    const User = await UserModel.findOne({email})
    if (User){
      const passwordMatch = await bcrypt.compare(password, User.password)
      if(passwordMatch){
        res.json("Success")
      }
      else {
        res.status(401).json("Password does not match!")
      }
      
    }else{
      res.status(401).json("No Records found")
    }
  }catch(error){
    res.status(500).json({error:error.message})
  }
}) */
