const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAllRead,
  getUnreadCount
} = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/mark-read', protect, markAllRead);

module.exports = router;