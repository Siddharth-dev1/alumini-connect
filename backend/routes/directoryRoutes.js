const express = require('express');
const router = express.Router();
const { searchAlumni, searchStudents } = require('../controllers/directoryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/alumni', protect, searchAlumni);
router.get('/students', protect, searchStudents);

module.exports = router;
