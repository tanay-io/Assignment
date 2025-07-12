const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const uploadRouter = require("./upload");

const generationsListRouter = require("./generations-list");
const authRouter = require("./auth");
const dashboardStatsRouter = require("./dashboard-stats");
const mongoose = require("mongoose");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use("/upload", uploadRouter);

app.use("/generations-list", generationsListRouter);
app.use("/auth", authRouter);
app.use("/dashboard-stats", dashboardStatsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
