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
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const mammoth = require("mammoth");
const { createWorker } = require("tesseract.js");
const dotenv = require("dotenv");
const Generation = require("./models/generation");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { put } = require("@vercel/blob");

const router = express.Router();
dotenv.config();

const upload = multer();

async function parsePdf(fileBuffer) {
  try {
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(fileBuffer);
    return data.text;
  } catch (error) {
    try {
      const text = fileBuffer.toString("utf8");
      const cleanedText = text
        .replace(/[^\x20-\x7E\n\r\t]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (cleanedText.length < 50) throw new Error();
      return cleanedText;
    } catch {
      throw new Error("Failed to parse PDF file.");
    }
  }
}

async function parseDocx(fileBuffer) {
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } catch {
    throw new Error("Failed to parse DOCX file.");
  }
}

async function performOcr(imageBuffer) {
  const worker = await createWorker("eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(imageBuffer);
    return text;
  } finally {
    await worker.terminate();
  }
}

async function generateContentWithAI(text, type) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  if (!process.env.GEMINI_API_KEY) return "Error: AI API key not configured.";
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
  let prompt;
  switch (type) {
    case "summary":
      prompt = `You are an expert HR assistant. Summarize the following job description in 3-5 sentences, focusing on the main responsibilities, company, and role highlights.\n\nJob Description:\n${text}`;
      break;
    case "key_points":
      prompt = `You are an expert recruiter. Extract the key requirements, qualifications, and skills from the following job description. Present them as a concise bulleted list.\n\nJob Description:\n${text}`;
      break;
    case "flashcards":
      prompt = `You are a data analyst. Convert the following job description into a structured JSON object with fields: title, company, location, responsibilities, requirements, and benefits.\n\nJob Description:\n${text}`;
      break;
    default:
      throw new Error("Invalid generation type.");
  }
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch {
    throw new Error("Failed to generate content with AI.");
  }
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

router.post("/", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    const { generationType, inputType, content, userId } = req.body;
    let fileContent = "";
    let originalFileName = "";
    let originalFileUrl = undefined;
    let file = req.file;

    const generationTypeMap = {
      job_summary: "summary",
      key_requirements: "key_points",
      structured_data: "flashcards",
    };
    let mappedType = generationTypeMap[generationType] || generationType;

    if (!["summary", "key_points", "flashcards"].includes(mappedType)) {
      return res
        .status(400)
        .json({ message: "Invalid generation type selected." });
    }

    if (inputType === "file" && file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return res.status(413).json({
          message: `File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB.`,
        });
      }
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({
          message: "Server configuration error: Blob storage not available.",
        });
      }
      const fileBuffer = file.buffer;
      const fileType = file.mimetype;
      originalFileName = file.originalname || "unnamed_file";
      let fileExtension = originalFileName.split(".").pop()?.toLowerCase();
      if (fileType === "application/pdf" || fileExtension === "pdf") {
        fileContent = await parsePdf(fileBuffer);
      } else if (
        fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileExtension === "docx"
      ) {
        fileContent = await parseDocx(fileBuffer);
      } else if (
        ["image/jpeg", "image/png"].includes(fileType) ||
        ["jpg", "jpeg", "png"].includes(fileExtension)
      ) {
        fileContent = await performOcr(fileBuffer);
      } else if (
        fileType.startsWith("text/") ||
        ["txt", "md", "csv", "json", "log"].includes(fileExtension)
      ) {
        fileContent = fileBuffer.toString("utf8");
      } else {
        return res.status(400).json({
          message: `Unsupported file type: ${fileType || fileExtension}`,
        });
      }

      const uniqueId = uuidv4();
      fileExtension = originalFileName.split(".").pop()?.toLowerCase();
      const blobFileName = `${originalFileName.substring(
        0,
        originalFileName.lastIndexOf(".")
      )}_${uniqueId}${fileExtension ? "." + fileExtension : ""}`;
      const blob = await put(blobFileName, fileBuffer, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      originalFileUrl = blob.url;
    } else if ((inputType === "text" || inputType === "url") && content) {
      fileContent = content;
      originalFileName =
        inputType === "url" ? "Submitted URL" : "Submitted Text";
      originalFileUrl = undefined;
    } else {
      return res
        .status(400)
        .json({ message: "No file, text, or URL provided." });
    }

    if (!fileContent || fileContent.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "No text content could be extracted from the file." });
    }

    const generatedContent = await generateContentWithAI(
      fileContent,
      mappedType
    );

    const newGenerationData = {
      originalContent: fileContent,
      generatedContent,
      fileName: originalFileName,
      generationType: mappedType,
      uploadDate: new Date(),
      userId: userId,
    };
    if (originalFileUrl) newGenerationData.originalFileUrl = originalFileUrl;

    const newGeneration = new Generation(newGenerationData);
    await newGeneration.save();

    res.status(200).json({
      generatedContent,
      message: "Content generated and saved successfully!",
      id: newGeneration._id.toString(),
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      message: error.message || "Something went wrong during processing.",
    });
  }
});

module.exports = router;
