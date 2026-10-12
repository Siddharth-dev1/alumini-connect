const onlineUsers = new Map(); // userId -> Set of socketIds

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    let currentUserId = null;

    // Join room corresponding to userId
    socket.on('join_room', (userId) => {
      if (!userId) return;
      currentUserId = userId.toString();
      socket.join(currentUserId);

      if (!onlineUsers.has(currentUserId)) {
        onlineUsers.set(currentUserId, new Set());
      }
      onlineUsers.get(currentUserId).add(socket.id);

      // Broadcast online status to all connected clients
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });

    // Request active online users
    socket.on('get_online_users', () => {
      socket.emit('online_users', Array.from(onlineUsers.keys()));
    });

    // Handle typing status directed to specific receiver or conversation
    socket.on('typing', ({ conversationId, userId, receiverId, isTyping }) => {
      if (receiverId) {
        socket.to(receiverId.toString()).emit('user_typing', {
          conversationId,
          userId,
          isTyping: !!isTyping
        });
      } else {
        // Fallback broadcast
        socket.broadcast.emit('user_typing', {
          conversationId,
          userId,
          isTyping: !!isTyping
        });
      }
    });

    // Mark messages read event
    socket.on('mark_read', ({ conversationId, readerId, senderId }) => {
      if (senderId) {
        socket.to(senderId.toString()).emit('messages_read', {
          conversationId,
          readBy: readerId
        });
      }
    });

    socket.on('disconnect', () => {
      if (currentUserId && onlineUsers.has(currentUserId)) {
        const userSockets = onlineUsers.get(currentUserId);
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(currentUserId);
        }
        io.emit('online_users', Array.from(onlineUsers.keys()));
      }
    });
  });
};

module.exports = socketHandler;
