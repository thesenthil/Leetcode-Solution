const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  applyForJob,
  deleteJob
} = require('../controllers/job.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getJobs);
router.post('/', protect, createJob);
router.post('/:id/apply', protect, applyForJob);
router.delete('/:id', protect, deleteJob);

module.exports = router;