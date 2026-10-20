const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

module.exports = (io) => {
  const {
    createPost,
    getFeedPosts,
    likePost,
    addComment,
    deletePost
  } = require('../controllers/post.controller')(io);

  // All post routes are protected
  router.get('/', protect, getFeedPosts);
  router.post('/', protect, upload.single('image'), createPost);
  router.put('/:id/like', protect, likePost);
  router.post('/:id/comment', protect, addComment);
  router.delete('/:id', protect, deletePost);

  return router;
};