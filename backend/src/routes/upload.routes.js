const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { uploadDocument } = require('../controllers/upload.controller');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', upload.single('document'), uploadDocument);

module.exports = router;
