const express = require('express');
const router = express.Router();
const { signup, login, sendVerificationEmail, verifyEmail, forgotPassword, resetPassword } = require('../controllers/auth.controllers');
const { protect } = require('../middleware/auth.middleware');
const {
  validateSignup,
  validateLogin
} = require('../middleware/validate.middleware');
const rateLimit = require('express-rate-limit');

// POST /api/auth/signup
router.post('/signup', validateSignup, signup);


// Strict limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // max 10 login attempts
  message: {
    success: false,
    message: 'Too many login attempts. Try again in 15 minutes.'
  }
});
// POST /api/auth/login
router.post('/login', validateLogin, login);
router.post(
  '/send-verification-email',
  authLimiter,
  protect,
  sendVerificationEmail
);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password',  authLimiter,forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;