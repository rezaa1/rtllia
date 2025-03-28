const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

// Chat session routes
router.post('/sessions', protect, chatController.createChatSession);
router.get('/sessions/:id', protect, chatController.getChatSessionById);
router.put('/sessions/:id', protect, chatController.updateChatSession);

// Chat message routes
router.get('/sessions/:id/messages', protect, chatController.getChatMessages);
router.post('/sessions/:id/messages', protect, chatController.sendChatMessage);

// Voice transition route
router.post('/sessions/:id/voice', protect, chatController.transitionToVoice);

module.exports = router;
