const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { getSettings, updateSettings, getPublicSettings } = require('../controllers/settingsController');

// Public routes
router.get('/public', getPublicSettings);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getSettings);
router.put('/', authenticateToken, requireAdmin, updateSettings);

module.exports = router;