const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  getOrCreateConversationWithUser,
  sendMessage,
  markConversationAsRead,
  deleteMessage,
  clearConversation,
  getEligibleUsersForChat
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/users/search', protect, getEligibleUsersForChat);
router.get('/user/:targetUserId', protect, getOrCreateConversationWithUser);
router.get('/:conversationId', protect, getMessages);
router.post('/send', protect, sendMessage);
router.put('/:conversationId/read', protect, markConversationAsRead);
router.delete('/:messageId', protect, deleteMessage);
router.delete('/conversation/:conversationId', protect, clearConversation);

module.exports = router;
