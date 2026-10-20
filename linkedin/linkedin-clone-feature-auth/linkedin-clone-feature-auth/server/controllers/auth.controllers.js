const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
// ─── Helper: Generate JWT Token ───────────────────────────────────────────

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },                        // payload: what we store in token
    process.env.JWT_SECRET,                // secret key to sign it
    { expiresIn: process.env.JWT_EXPIRES_IN }  // token expiry
  );
};

// ─── SIGNUP ───────────────────────────────────────────────────────────────

const signup = async (req, res) => {
  try {
    console.log('1. Signup hit');
    console.log('2. Body:', req.body);
    
    const { firstName, lastName, email, password } = req.body;
    console.log('3. Extracted fields:', { firstName, lastName, email });

    const existingUser = await User.findOne({ email });
    console.log('4. Existing user check done');

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password
    });
    console.log('5. User created:', user._id);
    console.log('5. User created:', user._id);
console.log('6. Generating token...');

const token = generateToken(user._id);
console.log('7. Token generated:', token ? 'YES' : 'NO');

console.log('8. Sending response...');
res.status(201).json({
  success: true,
  token,
  user: {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
  }
});
console.log('9. Response sent');

  } catch (error) {
    console.log('ERROR NAME:', error.name);
    console.log('ERROR MESSAGE:', error.message);
    console.log('ERROR STACK:', error.stack);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((e) => e.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
// ─── LOGIN ────────────────────────────────────────────────────────────────

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user and explicitly include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 2. Compare passwords
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 3. Generate token
    const token = generateToken(user._id);

    // 4. Send response
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
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
// ─── SEND VERIFICATION EMAIL ──────────────────────────────────────────────

const sendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // Generate random token
    const token = crypto.randomBytes(32).toString('hex');

    // Save token and expiry to user
    user.emailVerificationToken = token;
    user.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000;
    // expires in 24 hours

    await user.save({ validateBeforeSave: false });

    // Send email
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email',
      html: `
        <h1>Email Verification</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${verifyUrl}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: Date.now() }
      // $gt = greater than → token not expired
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiry = null;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always send same response
    // whether email exists or not
    // security through obscurity
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If that email exists, a reset link has been sent'
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');

    user.passwordResetToken = token;
    user.passwordResetExpiry = Date.now() + 60 * 60 * 1000;
    // expires in 1 hour

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, ignore this email.</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link has been sent'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
// ─── RESET PASSWORD ─────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    // pre('save') will hash it automatically ✅

    user.passwordResetToken = null;
    user.passwordResetExpiry = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {   signup,
  login,
  sendVerificationEmail,
  verifyEmail,
  forgotPassword,
  resetPassword
 };