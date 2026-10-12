const express = require('express');
const router = express.Router();
const {
  createMentorshipRequest,
  getMyMentorshipRequests,
  respondMentorshipRequest,
  getMentorshipSessions,
  updateSessionStatus
} = require('../controllers/mentorshipController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request', protect, createMentorshipRequest);
router.get('/my-requests', protect, getMyMentorshipRequests);
router.put('/respond', protect, respondMentorshipRequest);
router.get('/sessions', protect, getMentorshipSessions);
router.put('/sessions/:id/status', protect, updateSessionStatus);

module.exports = router;
