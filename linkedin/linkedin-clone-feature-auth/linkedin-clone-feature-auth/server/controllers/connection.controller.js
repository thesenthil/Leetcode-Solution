const Connection = require('../models/Connection.model');
const User = require('../models/User.model');

// ─── SEND REQUEST ─────────────────────────────────────────────────────────

const sendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const recipientId = req.params.id;

    // Cannot connect with yourself
    if (senderId.toString() === recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send request to yourself'
      });
    }

    // Check if request already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId }
      ]
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: 'Connection request already exists'
      });
    }

    const connection = await Connection.create({
      sender: senderId,
      recipient: recipientId
    });

    res.status(201).json({
      success: true,
      connection
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ─── ACCEPT REQUEST ───────────────────────────────────────────────────────

const acceptRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }

    // Only recipient can accept
    if (connection.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this request'
      });
    }

    connection.status = 'accepted';
    await connection.save();

    res.status(200).json({
      success: true,
      connection
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ─── GET MY CONNECTIONS ───────────────────────────────────────────────────

const getConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { sender: req.user._id, status: 'accepted' },
        { recipient: req.user._id, status: 'accepted' }
      ]
    })
    .populate('sender', 'firstName lastName profileImage headline')
    .populate('recipient', 'firstName lastName profileImage headline');

    res.status(200).json({
      success: true,
      connections
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ─── GET PENDING REQUESTS ─────────────────────────────────────────────────

const getPendingRequests = async (req, res) => {
  try {
    const requests = await Connection.find({
      recipient: req.user._id,
      status: 'pending'
    }).populate('sender', 'firstName lastName profileImage headline');

    res.status(200).json({
      success: true,
      requests
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  sendRequest,
  acceptRequest,
  getConnections,
  getPendingRequests
};