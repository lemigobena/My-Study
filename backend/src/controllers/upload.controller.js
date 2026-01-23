const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const axios = require('axios');
const { cloudinary } = require('../config/cloudinary');
const stream = require('stream');

const uploadDocument = async (req, res) => {
    console.log("Upload request received");
    if (!req.file) {
        console.error("No file in request");
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // File is in buffer now (MemoryStorage)
    const fileBuffer = req.file.buffer;
    const mimetype = req.file.mimetype;
    console.log(`File received in memory: ${req.file.originalname} (${mimetype}, ${fileBuffer.length} bytes)`);

    try {
        let extractedText = '';

        // 1. EXTRACT TEXT IMMEDIATELY
        if (mimetype === 'application/pdf') {
            const data = await pdfParse(fileBuffer);
            extractedText = data.text;
        } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            extractedText = result.value;
        } else if (mimetype === 'text/plain') {
            extractedText = fileBuffer.toString('utf8');
        } else {
            return res.status(400).json({ message: 'Unsupported file type for text extraction.' });
        }

        // 2. UPLOAD TO CLOUDINARY (Async Stream)
        const uploadStream = (buffer) => {
            return new Promise((resolve, reject) => {
                const writeStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'study_assistant_notes',
                        resource_type: 'auto'
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                const readStream = new stream.PassThrough();
                readStream.end(buffer);
                readStream.pipe(writeStream);
            });
        };

        console.log("Uploading to Cloudinary...");
        const cloudResult = await uploadStream(fileBuffer);
        console.log("Cloudinary Upload Success:", cloudResult.secure_url);

        // 3. AUTO-SUMMARIZE
        let summary = '';
        try {
            console.log("Requesting summary from ML service...");
            const mlResponse = await axios.post(
                `${process.env.ML_SERVICE_URL}/summarize`,
                { text: extractedText },
                { timeout: 60000 }
            );
            summary = mlResponse.data.summary;
        } catch (mlError) {
            console.error("ML Service Error:", mlError.message);
            if (mlError.code === 'ECONNREFUSED') {
                summary = "Summary unavailable (ML Service Offline)";
            } else if (mlError.code === 'ECONNABORTED') {
                summary = "Summary unavailable (Request Timed Out)";
            } else {
                summary = "Summary unavailable (ML Error)";
            }
        }

        res.json({ text: extractedText, summary, url: cloudResult.secure_url });

    } catch (error) {
        console.error("Error processing upload:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { uploadDocument };
