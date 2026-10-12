const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'connection_request',
      'connection_accepted',
      'connection_rejected',
      'mentorship_request',
      'mentorship_accepted',
      'mentorship_rejected',
      'mentorship_scheduled',
      'message',
      'job_posted',
      'event_created',
      'event_registration',
      'event_request_approved',
      'event_request_rejected',
      'admin_announcement'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: String,
    default: ''
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
