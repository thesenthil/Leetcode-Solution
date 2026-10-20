const Notification = require('../models/Notification.model');

const createNotification = async (io, {
  recipient,
  sender,
  type,
  post = null
}) => {
  try {
    // Don't notify yourself
    if (recipient.toString() === sender.toString()) return;

    // Create notification in DB
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      post
    });

    await notification.populate(
      'sender',
      'firstName lastName profileImage'
    );

    // Emit to recipient's personal room instantly
    io.to(recipient.toString()).emit(
      'new_notification',
      notification
    );

  } catch (error) {
    console.error('Notification error:', error);
  }
};

module.exports = createNotification;