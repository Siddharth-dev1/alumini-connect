const express = require('express');
const router = express.Router();
const { addResource, getResources, deleteResource } = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, getResources);
router.post('/', protect, authorize('student', 'alumni', 'admin'), upload.single('file'), addResource);
router.delete('/:id', protect, authorize('student', 'alumni', 'admin'), deleteResource);

module.exports = router;
