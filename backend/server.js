const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const aiRoutes = require("./routes/aiRoutes");
const courseRoutes = require("./routes/courseRoutes");

const app = express();

/*
========================
MIDDLEWARE
========================
*/
app.use(cors({
  origin: ['https://studyai-richmond.netlify.app', 
          'http://localhost:5500',
          'http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
========================
ROUTES
========================
*/
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/courses", courseRoutes);

/*
========================
TEST ROUTE
========================
*/
app.get("/test", (req, res) => {
  res.send("Server is working");
});

/*
========================
404 HANDLER
========================
*/
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/*
========================
START SERVER
========================
*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});