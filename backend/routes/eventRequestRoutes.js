const express = require('express');
const router = express.Router();
const {
  submitEventRequest,
  getEventRequests,
  respondEventRequest
} = require('../controllers/eventRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, submitEventRequest);
router.get('/', protect, getEventRequests);
router.put('/:id/respond', protect, authorize('admin'), respondEventRequest);

module.exports = router;
