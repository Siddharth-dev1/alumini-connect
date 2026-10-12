const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    enum: ['Career Guidance', 'Placement', 'Higher Studies', 'Technical Guidance', 'Entrepreneurship', 'Other'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  preferredDate: {
    type: String,
    required: true
  },
  preferredTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Scheduled', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  responseMessage: {
    type: String,
    default: ''
  },
  meetingLink: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
