const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
    createPaymentQR,
    checkPaymentStatus,
    confirmPayment,
    getSupportedBanks,
    simulatePaymentSuccess
} = require('../controllers/paymentController');

// User routes
router.post('/qr', authenticateToken, createPaymentQR);
router.get('/status/:don_hang_id', authenticateToken, checkPaymentStatus);
router.get('/banks', getSupportedBanks);
router.post('/simulate/:don_hang_id', authenticateToken, simulatePaymentSuccess); // Demo only

// Admin routes
router.post('/confirm/:don_hang_id', authenticateToken, requireAdmin, confirmPayment);

module.exports = router;