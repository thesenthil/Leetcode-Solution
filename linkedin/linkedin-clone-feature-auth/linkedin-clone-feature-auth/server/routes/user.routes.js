const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');
const { uploadProfileImage } = require('../controllers/user.controller');

// Public route — anyone can view a profile
router.get('/:id', getProfile);


// Protected route — must be logged in to update
router.put('/:id', protect, updateProfile);

router.post(
  '/upload-image',
  protect,
  upload.single('profileImage'),
  uploadProfileImage
);

module.exports = router;