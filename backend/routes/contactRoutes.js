const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
    sendContactMessage,
    getContactMessages,
    getContactMessageDetail,
    replyContactMessage,
    getContactStats
} = require('../controllers/contactController');

// Public routes
router.post('/', sendContactMessage);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getContactMessages);
router.get('/stats', authenticateToken, requireAdmin, getContactStats);
router.get('/:id', authenticateToken, requireAdmin, getContactMessageDetail);
router.post('/:id/reply', authenticateToken, requireAdmin, replyContactMessage);

module.exports = router;