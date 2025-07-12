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
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const total = await Generation.countDocuments({ userId });
    const completed = await Generation.countDocuments({
      userId,
      status: "completed",
    });
    const processing = await Generation.countDocuments({
      userId,
      status: "processing",
    });
    const thisMonth = await Generation.countDocuments({
      userId,
      uploadDate: { $gte: monthStart },
    });

    res.json({ total, completed, processing, thisMonth });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard stats." });
  }
});

module.exports = router;
