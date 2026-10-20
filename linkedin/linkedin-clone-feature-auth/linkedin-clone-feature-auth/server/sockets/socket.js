const jwt = require('jsonwebtoken');
const Message = require('../models/Message.model');

const setupSocket = (io) => {

  // Middleware — verify token on socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join personal room for notifications
    socket.join(socket.userId);

    // ─── Join Chat Room ──────────────────────────────────────

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room ${roomId}`);
    });

    // ─── Send Message ────────────────────────────────────────

    socket.on('send_message', async (data) => {
      try {
        const { recipientId, content } = data;

        // Save message to MongoDB
        const message = await Message.create({
          sender: socket.userId,
          recipient: recipientId,
          content
        });

        await message.populate(
          'sender',
          'firstName lastName profileImage'
        );

        // Create room ID — same for both users
        const roomId = [socket.userId, recipientId]
          .sort()
          .join('_');

        // Emit to everyone in room
        io.to(roomId).emit('receive_message', message);

      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ─── Typing Indicator ────────────────────────────────────

    socket.on('typing', (data) => {
      const roomId = [socket.userId, data.recipientId]
        .sort()
        .join('_');
      socket.to(roomId).emit('user_typing', {
        userId: socket.userId
      });
    });

    // ─── Disconnect ──────────────────────────────────────────

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};

module.exports = setupSocket;