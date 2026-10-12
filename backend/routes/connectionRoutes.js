const express = require('express');
const router = express.Router();
const {
  sendConnectionRequest,
  respondConnectionRequest,
  getMyConnections,
  getPendingRequests,
  getConnectionStatus
} = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, sendConnectionRequest);
router.put('/respond', protect, respondConnectionRequest);
router.get('/my-connections', protect, getMyConnections);
router.get('/pending', protect, getPendingRequests);
router.get('/status/:targetUserId', protect, getConnectionStatus);

module.exports = router;
