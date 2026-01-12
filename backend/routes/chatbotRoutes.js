const express = require('express');
const router = express.Router();
const { chat, getChatHistory } = require('../controllers/chatbotController');

// POST /api/chatbot/chat - Gửi tin nhắn và nhận phản hồi
router.post('/chat', chat);

// GET /api/chatbot/history/:sessionId - Lấy lịch sử chat
router.get('/history/:sessionId', getChatHistory);

module.exports = router;