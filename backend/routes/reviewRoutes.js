const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getProductReviews,
    canUserReview,
    createReview,
    getUserOrderReviews
} = require('../controllers/reviewController');

// Public routes
router.get('/product/:san_pham_id', getProductReviews);

// Protected routes
router.get('/can-review/:san_pham_id', authenticateToken, canUserReview);
router.post('/', authenticateToken, createReview);
router.get('/order/:don_hang_id', authenticateToken, getUserOrderReviews);

module.exports = router;