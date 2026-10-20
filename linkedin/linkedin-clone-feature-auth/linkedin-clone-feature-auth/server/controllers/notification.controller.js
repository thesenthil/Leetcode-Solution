const Notification = require('../models/Notification.model');

// ─── GET ALL NOTIFICATIONS ────────────────────────────────────────────────

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id
    })
    .populate('sender', 'firstName lastName profileImage')
    .populate('post', 'content')
    .sort({ createdAt: -1 })
    .limit(20);

    res.status(200).json({
      success: true,
      notifications
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ─── MARK ALL AS READ ─────────────────────────────────────────────────────

const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ─── GET UNREAD COUNT ─────────────────────────────────────────────────────

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    res.status(200).json({
      success: true,
      count
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getNotifications,
  markAllRead,
  getUnreadCount
};