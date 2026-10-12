const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter full name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please enter email address'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please enter password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'alumni', 'admin'],
    required: true
  },
  isVerified: {
    type: Boolean,
    default: function() {
      // Students and Admins are verified by default; Alumni require admin verification
      return this.role !== 'alumni';
    }
  },
  avatar: {
    type: String,
    default: ''
  },
  studentProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile'
  },
  alumniProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AlumniProfile'
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
