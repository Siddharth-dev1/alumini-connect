const express = require('express');
const router = express.Router();
const {
  getStudentProfile,
  getAlumniProfile,
  updateStudentProfile,
  updateAlumniProfile
} = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/student/:userId', protect, getStudentProfile);
router.get('/alumni/:userId', protect, getAlumniProfile);

router.put('/student', protect, authorize('student', 'admin'), updateStudentProfile);
router.put('/alumni', protect, authorize('alumni', 'admin'), updateAlumniProfile);

module.exports = router;
