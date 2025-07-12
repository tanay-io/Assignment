const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

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
const Generation = require("./models/generation");
const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const generations = await Generation.find({ userId: userId }).sort({
      uploadDate: -1,
    });
    res.status(200).json({ generations });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch generations." });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      userId,
      originalContent,
      generatedContent,
      fileName,
      generationType,
      userGivenName,
      originalFileUrl,
    } = req.body;
    if (
      !userId ||
      !originalContent ||
      !generatedContent ||
      !fileName ||
      !generationType
    ) {
      return res
        .status(400)
        .json({ message: "Missing required generation fields." });
    }
    const newGeneration = new Generation({
      userId,
      originalContent,
      generatedContent,
      fileName,
      generationType,
      userGivenName,
      originalFileUrl,
    });
    await newGeneration.save();
    res.status(201).json({
      message: "Generation created successfully!",
      generation: newGeneration,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create generation." });
  }
});

module.exports = router;
