const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get All Conversations for logged in User
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'name email role avatar isVerified')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name email role' }
      })
      .sort({ updatedAt: -1 });

    // Format list to include other user & unread count
    const formatted = await Promise.all(
      conversations.map(async (conv) => {
        const validParticipants = (conv.participants || []).filter(Boolean);
        const otherParticipant = validParticipants.find(p => p._id && p._id.toString() !== userId.toString()) || validParticipants[0] || null;
        
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          receiver: userId,
          isRead: false
        });

        return {
          _id: conv._id,
          otherParticipant,
          lastMessage: conv.lastMessage,
          unreadCount,
          updatedAt: conv.updatedAt
        };
      })
    );

    res.json(formatted);
  } catch (error) {
    console.error('Get Conversations Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Messages in a Conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.some(p => p && p.toString() === userId.toString())) {
      return res.status(403).json({ message: 'Not authorized to view this conversation' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar role email')
      .populate('receiver', 'name avatar role email')
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    const updateResult = await Message.updateMany(
      { conversation: conversationId, receiver: userId, isRead: false },
      { $set: { isRead: true } }
    );

    if (updateResult.modifiedCount > 0) {
      const io = req.app.get('io');
      if (io) {
        const otherParticipant = conversation.participants.find(p => p && p.toString() !== userId.toString());
        if (otherParticipant) {
          io.to(otherParticipant.toString()).emit('messages_read', {
            conversationId,
            readBy: userId
          });
        }
      }
    }

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get or Start Conversation with Target User
// @route   GET /api/messages/user/:targetUserId
// @access  Private
const getOrCreateConversationWithUser = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    if (targetUserId.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Cannot start conversation with yourself' });
    }

    const targetUser = await User.findById(targetUserId).select('name email role avatar isVerified');
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, targetUserId], $size: 2 }
    })
      .populate('participants', 'name email role avatar isVerified')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name email role' }
      });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, targetUserId]
      });
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email role avatar isVerified')
        .populate({
          path: 'lastMessage',
          populate: { path: 'sender', select: 'name email role' }
        });
    }

    const validParticipants = (conversation.participants || []).filter(Boolean);
    const otherParticipant = validParticipants.find(p => p._id && p._id.toString() !== userId.toString()) || targetUser;

    const unreadCount = await Message.countDocuments({
      conversation: conversation._id,
      receiver: userId,
      isRead: false
    });

    res.json({
      _id: conversation._id,
      otherParticipant,
      lastMessage: conversation.lastMessage,
      unreadCount,
      updatedAt: conversation.updatedAt
    });
  } catch (error) {
    console.error('Get/Create Conversation Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a Message
// @route   POST /api/messages/send
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !content || !content.trim()) {
      return res.status(400).json({ message: 'Receiver and non-empty content are required' });
    }

    if (receiverId.toString() === senderId.toString()) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId], $size: 2 }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId]
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      receiver: receiverId,
      content: content.trim()
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    const populatedMsg = await Message.findById(message._id)
      .populate('sender', 'name avatar role email')
      .populate('receiver', 'name avatar role email');

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId.toString()).emit('new_message', populatedMsg);
      io.to(senderId.toString()).emit('new_message', populatedMsg);
    }

    res.status(201).json(populatedMsg);
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark All Messages in a Conversation as Read
// @route   PUT /api/messages/:conversationId/read
// @access  Private
const markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const result = await Message.updateMany(
      { conversation: conversationId, receiver: userId, isRead: false },
      { $set: { isRead: true } }
    );

    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      const io = req.app.get('io');
      if (io) {
        const otherParticipant = conversation.participants.find(p => p && p.toString() !== userId.toString());
        if (otherParticipant) {
          io.to(otherParticipant.toString()).emit('messages_read', {
            conversationId,
            readBy: userId
          });
        }
      }
    }

    res.json({ success: true, updatedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a Single Message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    const conversationId = message.conversation;
    await Message.findByIdAndDelete(messageId);

    // Update conversation lastMessage
    const lastMsg = await Message.findOne({ conversation: conversationId }).sort({ createdAt: -1 });
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: lastMsg ? lastMsg._id : null
    });

    const io = req.app.get('io');
    if (io) {
      io.to(message.receiver.toString()).emit('message_deleted', { messageId, conversationId });
      io.to(message.sender.toString()).emit('message_deleted', { messageId, conversationId });
    }

    res.json({ success: true, messageId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear All Messages in a Conversation
// @route   DELETE /api/messages/conversation/:conversationId
// @access  Private
const clearConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.some(p => p && p.toString() === userId.toString())) {
      return res.status(403).json({ message: 'Not authorized to clear this conversation' });
    }

    await Message.deleteMany({ conversation: conversationId });
    conversation.lastMessage = null;
    await conversation.save();

    const io = req.app.get('io');
    if (io) {
      conversation.participants.forEach(p => {
        if (p) io.to(p.toString()).emit('conversation_cleared', { conversationId });
      });
    }

    res.json({ success: true, message: 'Conversation cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Eligible Users for Starting New Chat
// @route   GET /api/messages/users/search
// @access  Private
const getEligibleUsersForChat = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { q } = req.query;

    let filter = { _id: { $ne: currentUserId } };
    if (q && q.trim()) {
      filter.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { email: { $regex: q.trim(), $options: 'i' } },
        { role: { $regex: q.trim(), $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('name email role avatar isVerified')
      .sort({ name: 1 });
    res.json(users);
  } catch (error) {
    console.error('Get Eligible Users Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  getOrCreateConversationWithUser,
  sendMessage,
  markConversationAsRead,
  deleteMessage,
  clearConversation,
  getEligibleUsersForChat
};
