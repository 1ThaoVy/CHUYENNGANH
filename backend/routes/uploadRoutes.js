const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Sử dụng thư mục image gốc
        cb(null, 'image/');
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        // Return false instead of error to prevent crash
        return cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: fileFilter
});

// Upload single image (Admin only)
router.post('/image', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Không có file được upload' });
        }

        const imageUrl = `/images/${req.file.filename}`;
        
        res.json({
            success: true,
            message: 'Upload ảnh thành công',
            imageUrl: imageUrl,
            data: {
                filename: req.file.filename,
                url: imageUrl,
                size: req.file.size
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi upload ảnh', error: error.message });
    }
});

// Upload multiple images (Admin only)
router.post('/images', authenticateToken, requireAdmin, upload.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có file được upload' });
        }

        const images = req.files.map(file => ({
            filename: file.filename,
            url: `/images/${file.filename}`,
            size: file.size
        }));

        res.json({
            success: true,
            message: `Upload ${images.length} ảnh thành công`,
            data: images
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi upload ảnh', error: error.message });
    }
});

module.exports = router;
