const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  prn: {
    type: String,
    default: function() { return `PRN${Date.now()}`; },
    trim: true
  },
  department: {
    type: String,
    default: 'CSBS',
    trim: true
  },
  batch: {
    type: String,
    default: '2026',
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  interests: [{
    type: String
  }],
  bio: {
    type: String,
    default: ''
  },
  careerGoals: {
    type: String,
    default: ''
  },
  education: [{
    degree: String,
    institution: String,
    year: String,
    score: String
  }],
  projects: [{
    title: String,
    description: String,
    link: String
  }],
  socialLinks: {
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
