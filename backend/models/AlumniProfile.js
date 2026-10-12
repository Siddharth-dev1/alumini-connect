const mongoose = require('mongoose');

const alumniProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  graduationYear: {
    type: Number,
    default: 2024
  },
  department: {
    type: String,
    default: 'CSBS',
    trim: true
  },
  currentCompany: {
    type: String,
    default: 'Not specified',
    trim: true
  },
  jobTitle: {
    type: String,
    default: 'Alumni',
    trim: true
  },
  industry: {
    type: String,
    default: 'Technology',
    trim: true
  },
  location: {
    type: String,
    default: 'Kolhapur, India',
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  expertise: [{
    type: String
  }],
  bio: {
    type: String,
    default: ''
  },
  education: [{
    degree: String,
    institution: String,
    year: String
  }],
  experience: [{
    company: String,
    title: String,
    duration: String,
    description: String
  }],
  achievements: [{
    type: String
  }],
  socialLinks: {
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AlumniProfile', alumniProfileSchema);
