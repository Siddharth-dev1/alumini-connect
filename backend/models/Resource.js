const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Resume Guide', 'Interview Prep', 'Career Guide', 'Technical Docs', 'Placement Material', 'Other'],
    default: 'Career Guide'
  },
  fileUrl: {
    type: String,
    default: ''
  },
  externalUrl: {
    type: String,
    default: ''
  },
  fileType: {
    type: String,
    default: 'PDF'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
