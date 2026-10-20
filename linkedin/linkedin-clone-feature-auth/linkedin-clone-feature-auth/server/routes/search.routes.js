const express = require('express');
const router = express.Router();
const {
  searchUsers,
  searchPosts,
  searchJobs
} = require('../controllers/search.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/users', protect, searchUsers);
router.get('/posts', protect, searchPosts);
router.get('/jobs', protect, searchJobs);

module.exports = router;