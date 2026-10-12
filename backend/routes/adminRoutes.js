const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  toggleAlumniVerification,
  updateUserByAdmin,
  deleteUserByAdmin
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/verify-alumni/:userId', toggleAlumniVerification);
router.put('/users/:userId', updateUserByAdmin);
router.delete('/users/:userId', deleteUserByAdmin);

module.exports = router;
