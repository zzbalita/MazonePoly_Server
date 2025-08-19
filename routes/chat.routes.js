const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getChatHistory,
  sendMessage,
  getChatSessions,
  createChatSession,
  closeChatSession
} = require('../controllers/chat.controller');

// All chat routes require authentication
router.use(authMiddleware);

// Get all chat sessions for user
router.get('/sessions', getChatSessions);

// Create new chat session
router.post('/sessions', createChatSession);

// Get chat history for specific session
router.get('/sessions/:sessionId', getChatHistory);

// Send message to specific session
router.post('/sessions/:sessionId/messages', sendMessage);

// Close chat session
router.patch('/sessions/:sessionId/close', closeChatSession);

module.exports = router;
