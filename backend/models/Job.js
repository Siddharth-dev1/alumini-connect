const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
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
    enum: ['Job', 'Internship', 'Training Program'],
    default: 'Job'
  },
  location: {
    type: String,
    required: true
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Remote', 'Hybrid', 'On-site'],
    default: 'Full-time'
  },
  skillsRequired: [{
    type: String
  }],
  eligibility: {
    type: String,
    default: 'All Graduates'
  },
  salaryOrStipend: {
    type: String,
    default: 'Not disclosed'
  },
  deadline: {
    type: Date,
    required: true
  },
  applicationLink: {
    type: String,
    default: ''
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Closed'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
