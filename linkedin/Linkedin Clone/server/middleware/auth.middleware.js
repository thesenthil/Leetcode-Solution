const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const protect = async (req, res, next) => {
  try {
    // 1. Check if token exists in request headers
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. No token provided.'
      });
    }

    // 2. Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    // 3. Verify token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find user from token payload
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    // 5. Attach user to request object
    req.user = user;

    // 6. Move to next middleware or controller
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid token.'
    });
  }
};

module.exports = { protect };