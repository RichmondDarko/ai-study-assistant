const express = require("express");
const router = express.Router();

const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const { CohereClient } = require("cohere-ai");
const { chunkText, findBestChunk } = require("../utils/rag");

/*
========================================
COHERE SETUP
========================================
*/
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

/*
========================================
AI CHAT (TASK-BASED RAG SYSTEM)
========================================
*/
router.post("/chat", authMiddleware, async (req, res) => {
  try {

    const { message, task } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Message is required"
      });
    }

    /*
    ========================================
    GET USER NOTES
    ========================================
    */
    const notes = await pool.query(
      `SELECT content FROM notes WHERE user_id = $1`,
      [req.user.id]
    );

    const fullText = notes.rows.length
      ? notes.rows.map(n => n.content).join("\n\n")
      : "";

    if (!fullText) {
      return res.json({
        answer: "No notes found. Please upload a file first."
      });
    }

    /*
    ========================================
    RAG PROCESS
    ========================================
    */
    const chunks = chunkText(fullText, 1000);
    const bestChunk = findBestChunk(chunks, message);

    /*
    ========================================
    TASK INSTRUCTIONS
    ========================================
    */
    let instruction = "";

    switch (task) {
      case "summarize":
        instruction = "Summarize the notes clearly and simply.";
        break;

      case "explain":
        instruction = "Explain the content in simple terms with examples.";
        break;

      case "quiz":
        instruction = "Generate quiz questions and answers from the notes.";
        break;

      case "ask":
      default:
        instruction = "Answer the question using ONLY the notes.";
        break;
    }

    /*
    ========================================
    COHERE AI RESPONSE
    ========================================
    */
    const response = await cohere.chat({
      model: "command-a-03-2025",
      message: message,
      preamble: `
You are an AI Study Assistant.

${instruction}

Use ONLY this context:

${bestChunk}

If the answer is not in the notes, say you don't know.
      `
    });

    return res.json({
      answer: response.text
    });

  } catch (error) {
    console.error("AI ERROR:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

module.exports = router;