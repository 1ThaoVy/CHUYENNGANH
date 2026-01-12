const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getContactReplyDetail
} = require('../controllers/notificationController');

// User routes (require authentication)
router.get('/', authenticateToken, getUserNotifications);
router.put('/:id/read', authenticateToken, markNotificationAsRead);
router.put('/read-all', authenticateToken, markAllNotificationsAsRead);
router.delete('/:id', authenticateToken, deleteNotification);
router.get('/contact-reply/:lien_he_id', authenticateToken, getContactReplyDetail);

module.exports = router;