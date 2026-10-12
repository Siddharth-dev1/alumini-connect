const mongoose = require('mongoose');

const eventRequestSchema = new mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  proposedDate: {
    type: Date,
    required: true
  },
  eventType: {
    type: String,
    enum: ['Webinar', 'Workshop', 'Alumni Meet', 'Industrial Visit', 'Career Event', 'Training Program', 'Networking Event'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  expectedParticipants: {
    type: Number,
    default: 50
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  adminRemarks: {
    type: String,
    default: ''
  },
  createdEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EventRequest', eventRequestSchema);
