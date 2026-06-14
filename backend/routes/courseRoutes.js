const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

/*
========================================
CREATE COURSE
========================================
*/
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required"
      });
    }

    const result = await pool.query(
      `INSERT INTO courses (user_id, title, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, title, description || ""]
    );

    return res.status(201).json({
      message: "Course created successfully",
      course: result.rows[0]
    });

  } catch (error) {
    console.error("CREATE COURSE ERROR:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

/*
========================================
GET ALL COURSES (for logged-in user)
========================================
*/
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM courses
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.json({
      courses: result.rows
    });

  } catch (error) {
    console.error("GET COURSES ERROR:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

module.exports = router;