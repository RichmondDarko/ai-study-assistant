const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/pdf", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const cleanText = pdfData.text
      .replace(/[\u0080-\u009F]/g, '')
      .replace(/[\u2000-\u206F]/g, ' ')
      .replace(/[\u2070-\u209F]/g, '')
      .replace(/[\uFFF0-\uFFFF]/g, '')
      .replace(/[^\x00-\x7F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const savedNote = await pool.query(
      `INSERT INTO notes (user_id, filename, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, req.file.filename, cleanText]
    );

    return res.json({
      message: "PDF uploaded and saved successfully",
      note: savedNote.rows[0]
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/notes", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, filename, LEFT(content, 300) AS preview, created_at
       FROM notes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json({ notes: result.rows });

  } catch (error) {
    console.error("GET NOTES ERROR:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;


// DELETE A NOTE
router.delete("/notes/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, req.user.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: "Document not found" });
    }
    return res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});