const User = require("../model/User");
const jwt = require("jsonwebtoken");


const getUsers = async (req, res) => {
  try {
    const users = await User.find().lean();

    const now = Date.now();
    const activeThreshold = 60 * 1000; // 1 minute

    const usersWithStatus = users.map((user) => ({
      ...user,
      isActive:
        user.lastSeen &&
        now - new Date(user.lastSeen).getTime() <= activeThreshold,
    }));

    res.status(200).json(usersWithStatus);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};




const ping = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(200).json({ message: "User not logged in" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    if (decoded?.id) {
      await User.findByIdAndUpdate(decoded.id, { lastSeen: Date.now() });
      return res.status(200).json({ message: "Ping updated" });
    }

    return res.status(403).json({ message: "Invalid token" });
  } catch (err) {
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};


module.exports = {
  getUsers,
  ping
};
