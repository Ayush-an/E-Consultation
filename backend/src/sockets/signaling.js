const { Server } = require('socket.io');

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Track active rooms
  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // Join a consultation room
    socket.on('join-room', ({ roomId, userId, role }) => {
      socket.join(roomId);
      
      // Track room participants
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }
      rooms.get(roomId).set(socket.id, { userId, role, socketId: socket.id });
      
      console.log(`[Socket] ${role} (${userId}) joined room ${roomId} | Participants: ${rooms.get(roomId).size}`);

      // Notify other participants
      socket.to(roomId).emit('user-joined', { userId, role, socketId: socket.id });

      // Send existing participants to the newly joined user
      const participants = [];
      rooms.get(roomId).forEach((p, sid) => {
        if (sid !== socket.id) participants.push(p);
      });
      socket.emit('room-participants', participants);
    });

    // WebRTC Signaling: Offer
    socket.on('offer', ({ roomId, offer, to }) => {
      console.log(`[Signal] Offer from ${socket.id} to ${to || 'room'}`);
      if (to) {
        io.to(to).emit('offer', { offer, from: socket.id });
      } else {
        socket.to(roomId).emit('offer', { offer, from: socket.id });
      }
    });

    // WebRTC Signaling: Answer
    socket.on('answer', ({ roomId, answer, to }) => {
      console.log(`[Signal] Answer from ${socket.id} to ${to || 'room'}`);
      if (to) {
        io.to(to).emit('answer', { answer, from: socket.id });
      } else {
        socket.to(roomId).emit('answer', { answer, from: socket.id });
      }
    });

    // WebRTC Signaling: ICE Candidate
    socket.on('ice-candidate', ({ roomId, candidate, to }) => {
      if (to) {
        io.to(to).emit('ice-candidate', { candidate, from: socket.id });
      } else {
        socket.to(roomId).emit('ice-candidate', { candidate, from: socket.id });
      }
    });

    // Real-time Chat
    socket.on('chat-message', ({ roomId, message, sender, senderName, timestamp }) => {
      io.to(roomId).emit('chat-message', { message, sender, senderName, timestamp, socketId: socket.id });
    });

    // Media toggle notifications
    socket.on('media-toggle', ({ roomId, type, enabled }) => {
      socket.to(roomId).emit('media-toggle', { socketId: socket.id, type, enabled });
    });

    // Screen sharing
    socket.on('screen-share-start', ({ roomId }) => {
      socket.to(roomId).emit('screen-share-start', { socketId: socket.id });
    });

    socket.on('screen-share-stop', ({ roomId }) => {
      socket.to(roomId).emit('screen-share-stop', { socketId: socket.id });
    });

    // Call ended
    socket.on('end-call', ({ roomId }) => {
      socket.to(roomId).emit('call-ended', { socketId: socket.id });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
      
      // Clean up room participation
      rooms.forEach((participants, roomId) => {
        if (participants.has(socket.id)) {
          const user = participants.get(socket.id);
          participants.delete(socket.id);
          socket.to(roomId).emit('user-disconnected', { userId: user.userId, role: user.role, socketId: socket.id });
          
          if (participants.size === 0) {
            rooms.delete(roomId);
          }
        }
      });
    });
  });

  return io;
};
