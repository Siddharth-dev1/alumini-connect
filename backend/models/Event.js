const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Webinar', 'Workshop', 'Alumni Meet', 'Industrial Visit', 'Career Event', 'Training Program', 'Networking Event'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  speaker: {
    type: String,
    default: ''
  },
  eligibility: {
    type: String,
    default: 'Open to all'
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  registrationLink: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
