const User = require('../models/User.model');
const Post = require('../models/Post.model');
const Job = require('../models/Job.model');

// ─── SEARCH USERS ─────────────────────────────────────────────────────────

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query required'
      });
    }

    // Regex search — case insensitive
    const regex = new RegExp(q, 'i');

    const users = await User.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { headline: regex }
      ]
    })
    .select('firstName lastName profileImage headline')
    .limit(10);

    res.status(200).json({
      success: true,
      users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ─── SEARCH POSTS ─────────────────────────────────────────────────────────

const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query required'
      });
    }

    const posts = await Post.find({
      content: new RegExp(q, 'i')
    })
    .populate('author', 'firstName lastName profileImage')
    .sort({ createdAt: -1 })
    .limit(10);

    res.status(200).json({
      success: true,
      posts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ─── SEARCH JOBS ──────────────────────────────────────────────────────────

const searchJobs = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query required'
      });
    }

    // Text search using index we created in Job model
    const jobs = await Job.find({
      $text: { $search: q }
    })
    .populate('postedBy', 'firstName lastName')
    .limit(10);

    res.status(200).json({
      success: true,
      jobs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = { searchUsers, searchPosts, searchJobs };