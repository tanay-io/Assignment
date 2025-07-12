const mongoose = require("mongoose");

const GenerationSchema = new mongoose.Schema({
  originalContent: { type: String, required: true },
  generatedContent: { type: String, required: true },
  fileName: { type: String, required: true },
  generationType: {
    type: String,
    enum: ["summary", "flashcards", "key_points"],
    required: true,
  },
  userGivenName: { type: String },
  uploadDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["completed", "processing"],
    default: "completed",
    required: true,
  },
  originalFileUrl: {
    type: String,
    required: false,
    default: undefined,
    sparse: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports =
  mongoose.models.Generation || mongoose.model("Generation", GenerationSchema);
