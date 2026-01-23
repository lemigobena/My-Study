const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
// Expecting CLOUDINARY_URL in .env or individual keys
if (!process.env.CLOUDINARY_URL) {
    console.warn("CLOUDINARY_URL is missing! Uploads might fail.");
}

cloudinary.config({
    secure: true
});

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };
