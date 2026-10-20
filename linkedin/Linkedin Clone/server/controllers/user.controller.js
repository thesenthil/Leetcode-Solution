const User = require('../models/User.model');
const { cloudinary } = require('../config/cloudinary');
// ─── GET Profile ──────────────────────────────────────────────────────────

const getProfile = async (req, res) => {
  try {
    // req.params.id = the id in the URL /api/users/:id
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ─── UPDATE Profile ───────────────────────────────────────────────────────

const updateProfile = async (req, res) => {
  try {
    // Authorization check
    // req.user._id = logged in user (from middleware)
    // req.params.id = profile being edited (from URL)
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    // Fields allowed to update
    const allowedFields = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      headline: req.body.headline,
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      allowedFields,
      {
        new: true,        // return updated document
        runValidators: true // run schema validators
      }
    );

    res.status(200).json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    // req.file added by multer automatically
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Cloudinary URL is in req.file.path
    const imageUrl = req.file.path;

    // Save URL to user in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true }
    );
      res.status(200).json({
      success: true,
      imageUrl,
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
};


module.exports = { getProfile, updateProfile ,uploadProfileImage};