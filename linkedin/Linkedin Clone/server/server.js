const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const setupSocket = require('./sockets/socket');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Create HTTP server from Express app
const server = http.createServer(app);

// Attach Socket.io to HTTP server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

// General rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // max 100 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  }
});

// Strict limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // max 10 login attempts
  message: {
    success: false,
    message: 'Too many login attempts. Try again in 15 minutes.'
  }
});
// Setup socket events
setupSocket(io);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // parse form-encoded bodies

// Routes
// Apply general limit to all routes
app.use('/api', generalLimiter);

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/posts', require('./routes/post.routes')(io));
app.use('/api/connections', require('./routes/connection.routes'));
app.use('/api/jobs', require('./routes/job.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/search', require('./routes/search.routes'));

// Global error handler
// Must have 4 parameters — Express identifies it as error handler
// Must be registered AFTER all routes
app.use((err, req, res, next) => {
  console.error('ERROR:', err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(', ')
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server error'
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  });