const ConnectionRequest = require('../models/ConnectionRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Send Connection Request
// @route   POST /api/connections/send
// @access  Private
const sendConnectionRequest = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ message: 'You cannot send a connection request to yourself' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    // Check existing request in either direction
    const existing = await ConnectionRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existing) {
      if (existing.status === 'pending') {
        return res.status(400).json({ message: 'Connection request is already pending' });
      }
      if (existing.status === 'accepted') {
        return res.status(400).json({ message: 'You are already connected with this user' });
      }
      // If rejected or cancelled, update and resend
      existing.sender = senderId;
      existing.receiver = receiverId;
      existing.status = 'pending';
      existing.message = message || 'I would like to connect with you on Alumni Connect.';
      await existing.save();

      // Create notification
      await Notification.create({
        recipient: receiverId,
        sender: senderId,
        type: 'connection_request',
        title: 'New Connection Request',
        message: `${req.user.name} sent you a connection request.`,
        relatedId: existing._id.toString()
      });

      return res.json({ message: 'Connection request sent successfully', connectionRequest: existing });
    }

    const newRequest = await ConnectionRequest.create({
      sender: senderId,
      receiver: receiverId,
      message: message || 'I would like to connect with you on Alumni Connect.'
    });

    // Send Notification to Receiver
    await Notification.create({
      recipient: receiverId,
      sender: senderId,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${req.user.name} sent you a connection request.`,
      relatedId: newRequest._id.toString()
    });

    res.status(201).json({ message: 'Connection request sent successfully', connectionRequest: newRequest });
  } catch (error) {
    console.error('Send Connection Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Respond to Connection Request (Accept/Reject)
// @route   PUT /api/connections/respond
// @access  Private
const respondConnectionRequest = async (req, res) => {
  try {
    const { requestId, status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status response' });
    }

    const request = await ConnectionRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    request.status = status;
    await request.save();

    // Create Notification for Sender
    const notificationType = status === 'accepted' ? 'connection_accepted' : 'connection_rejected';
    const title = status === 'accepted' ? 'Connection Request Accepted' : 'Connection Request Declined';
    const msgContent = status === 'accepted'
      ? `${req.user.name} accepted your connection request.`
      : `${req.user.name} declined your connection request.`;

    await Notification.create({
      recipient: request.sender,
      sender: req.user._id,
      type: notificationType,
      title: title,
      message: msgContent,
      relatedId: request._id.toString()
    });

    res.json({ message: `Connection request ${status}`, request });
  } catch (error) {
    console.error('Respond Connection Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get List of Accepted Connections
// @route   GET /api/connections/my-connections
// @access  Private
const getMyConnections = async (req, res) => {
  try {
    const userId = req.user._id;

    const acceptedRequests = await ConnectionRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'accepted'
    })
      .populate({
        path: 'sender',
        select: 'name email role avatar isVerified studentProfile alumniProfile',
        populate: [{ path: 'studentProfile' }, { path: 'alumniProfile' }]
      })
      .populate({
        path: 'receiver',
        select: 'name email role avatar isVerified studentProfile alumniProfile',
        populate: [{ path: 'studentProfile' }, { path: 'alumniProfile' }]
      });

    const connections = acceptedRequests.map(reqItem => {
      if (reqItem.sender._id.toString() === userId.toString()) {
        return {
          connectionId: reqItem._id,
          user: reqItem.receiver,
          connectedSince: reqItem.updatedAt
        };
      } else {
        return {
          connectionId: reqItem._id,
          user: reqItem.sender,
          connectedSince: reqItem.updatedAt
        };
      }
    });

    res.json(connections);
  } catch (error) {
    console.error('Get My Connections Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Pending Connection Requests (Incoming & Outgoing)
// @route   GET /api/connections/pending
// @access  Private
const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const incoming = await ConnectionRequest.find({
      receiver: userId,
      status: 'pending'
    }).populate({
      path: 'sender',
      select: 'name email role avatar isVerified studentProfile alumniProfile',
      populate: [{ path: 'studentProfile' }, { path: 'alumniProfile' }]
    });

    const outgoing = await ConnectionRequest.find({
      sender: userId,
      status: 'pending'
    }).populate({
      path: 'receiver',
      select: 'name email role avatar isVerified studentProfile alumniProfile',
      populate: [{ path: 'studentProfile' }, { path: 'alumniProfile' }]
    });

    res.json({ incoming, outgoing });
  } catch (error) {
    console.error('Get Pending Requests Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check connection status with target user
// @route   GET /api/connections/status/:targetUserId
// @access  Private
const getConnectionStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetUserId } = req.params;

    if (userId.toString() === targetUserId.toString()) {
      return res.json({ status: 'self' });
    }

    const conn = await ConnectionRequest.findOne({
      $or: [
        { sender: userId, receiver: targetUserId },
        { sender: targetUserId, receiver: userId }
      ]
    });

    if (!conn) {
      return res.json({ status: 'none' });
    }

    if (conn.status === 'accepted') {
      return res.json({ status: 'accepted', requestId: conn._id });
    }

    if (conn.status === 'pending') {
      if (conn.sender.toString() === userId.toString()) {
        return res.json({ status: 'pending_sent', requestId: conn._id });
      } else {
        return res.json({ status: 'pending_received', requestId: conn._id });
      }
    }

    res.json({ status: conn.status, requestId: conn._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendConnectionRequest,
  respondConnectionRequest,
  getMyConnections,
  getPendingRequests,
  getConnectionStatus
};
