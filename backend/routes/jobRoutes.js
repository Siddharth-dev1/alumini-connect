const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyToJob,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getJobs);
router.post('/', protect, createJob);
router.get('/my-applications', protect, getMyApplications);
router.get('/:id', protect, getJobById);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);

router.post('/:id/apply', protect, applyToJob);
router.get('/:id/applications', protect, getJobApplications);
router.put('/applications/:appId/status', protect, updateApplicationStatus);

module.exports = router;
