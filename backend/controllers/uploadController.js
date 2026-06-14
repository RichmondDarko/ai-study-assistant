const fs = require("fs");
const pdfParse = require("pdf-parse");
const pool = require("../config/db");

exports.uploadPDF = async (req, res) => {

    try {

        const file = req.file;

        if (!file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }

        const dataBuffer =
            fs.readFileSync(file.path);

        const pdfData =
            await pdfParse(dataBuffer);

        const extractedText =
            pdfData.text;

        const result = await pool.query(
            `INSERT INTO documents 
            (user_id, filename, filepath, extracted_text)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                req.user?.id || null,
                file.filename,
                file.path,
                extractedText
            ]
        );

        res.json({
            message: "PDF uploaded successfully",
            filename: file.filename,
            textPreview: extractedText.slice(0, 300),
            document: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }
};