function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ message: "No token provided." });
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided." });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
}
const express = require("express");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already taken." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;
    res.status(201).json({
      message: "User registered successfully!",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({
      message: "Login successful!",
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to login." });
  }
});

router.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logged out." });
});

router.get("/session", authenticateToken, (req, res) => {
  res
    .status(200)
    .json({ user: { id: req.user.id, username: req.user.username } });
});

module.exports = router;
