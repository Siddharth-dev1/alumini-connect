const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  registerForEvent,
  cancelEventRegistration,
  getEventRegistrations,
  getMyRegisteredEvents
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getEvents);
router.post('/', protect, createEvent);
router.get('/my-registrations', protect, getMyRegisteredEvents);
router.get('/:id', protect, getEventById);

router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, cancelEventRegistration);
router.get('/:id/registrations', protect, getEventRegistrations);

module.exports = router;
