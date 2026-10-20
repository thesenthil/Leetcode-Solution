const Post = require('../models/Post.model');
const createNotification = require('../utils/createNotification');
const User = require('../models/User.model');
// ─── CREATE POST ──────────────────────────────────────────────────────────

const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    const post = await Post.create({
      author: req.user._id,    // from protect middleware
      content,
      image: req.file?.path || ''
    });

    // Populate author before sending response
    await post.populate('author', 'firstName lastName profileImage');

    res.status(201).json({
      success: true,
      post
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ─── GET FEED POSTS ───────────────────────────────────────────────────────

const getFeedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'firstName lastName profileImage headline')
      .populate('comments.user', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })    // newest first
      .skip(skip)                  // pagination
      .limit(limit);               // max per page

    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        hasMore: page * limit < totalPosts
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ─── LIKE / UNLIKE POST ───────────────────────────────────────────────────


const likePost = (io) => async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const alreadyLiked = post.likes.includes(req.user._id);

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      post.likes.push(req.user._id);

      // Create notification only when liking not unliking
      await createNotification(io, {
        recipient: post.author,
        sender: req.user._id,
        type: 'like',
        post: post._id
      });
    }

    await post.save();

    res.status(200).json({
      success: true,
      likes: post.likes,
      isLiked: !alreadyLiked
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
// ─── ADD COMMENT ──────────────────────────────────────────────────────────

const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Push new comment into comments array
    post.comments.push({
      user: req.user._id,
      text
    });

    await post.save();

    // Populate comments before sending
    await post.populate('comments.user', 'firstName lastName profileImage');

    res.status(201).json({
      success: true,
      comments: post.comments
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ─── DELETE POST ──────────────────────────────────────────────────────────

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Authorization — only author can delete
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = (io) => ({
  createPost,
  getFeedPosts,
  likePost: likePost(io),
  addComment,
  deletePost
});