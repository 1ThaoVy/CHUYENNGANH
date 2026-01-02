const express = require('express');
const router = express.Router();
const { register, login, getMe, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.get('/profile', authenticateToken, getProfile);
router.put('/update-profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

// Admin routes
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = require('../config/database');
        const [users] = await db.execute(`
            SELECT nguoi_dung_id, ho_ten, email, so_dien_thoai, vai_tro, 
                   dia_chi, ngay_tao, trang_thai
            FROM nguoi_dung 
            ORDER BY ngay_tao DESC
        `);
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
});

module.exports = router;
