const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'alumni_connect_super_secret_jwt_key_2026_kit_kolhapur', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, ...profileDetails } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = role.trim().toLowerCase();

    if (!['student', 'alumni', 'admin'].includes(cleanRole)) {
      return res.status(400).json({ message: `Invalid user role '${role}'` });
    }

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create Base User
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: cleanRole,
      isVerified: cleanRole !== 'alumni' // Alumni require admin verification by default unless specified
    });

    if (cleanRole === 'student') {
      const studentProfile = await StudentProfile.create({
        user: user._id,
        prn: (profileDetails.prn && profileDetails.prn.trim()) || `PRN${Date.now()}`,
        department: profileDetails.department || 'Computer Science & Business Systems',
        batch: profileDetails.batch || '2026',
        phone: profileDetails.phone || '',
        skills: Array.isArray(profileDetails.skills)
          ? profileDetails.skills
          : (profileDetails.skills ? profileDetails.skills.split(',').map(s => s.trim()) : []),
        interests: Array.isArray(profileDetails.interests)
          ? profileDetails.interests
          : (profileDetails.interests ? profileDetails.interests.split(',').map(s => s.trim()) : []),
        bio: profileDetails.bio || ''
      });
      user.studentProfile = studentProfile._id;
      await user.save();
    } else if (cleanRole === 'alumni') {
      const alumniProfile = await AlumniProfile.create({
        user: user._id,
        graduationYear: Number(profileDetails.graduationYear) || 2024,
        department: profileDetails.department || 'Computer Science & Business Systems',
        currentCompany: profileDetails.currentCompany || 'Tech Corp',
        jobTitle: profileDetails.jobTitle || 'Software Engineer',
        industry: profileDetails.industry || 'Technology',
        location: profileDetails.location || 'Pune, India',
        phone: profileDetails.phone || '',
        skills: Array.isArray(profileDetails.skills)
          ? profileDetails.skills
          : (profileDetails.skills ? profileDetails.skills.split(',').map(s => s.trim()) : []),
        expertise: Array.isArray(profileDetails.expertise)
          ? profileDetails.expertise
          : (profileDetails.expertise ? profileDetails.expertise.split(',').map(s => s.trim()) : ['Career Guidance', 'Placement Prep']),
        bio: profileDetails.bio || ''
      });
      user.alumniProfile = alumniProfile._id;
      await user.save();
    }

    const populatedUser = await User.findById(user._id)
      .populate('studentProfile')
      .populate('alumniProfile');

    res.status(201).json({
      _id: populatedUser._id,
      name: populatedUser.name,
      email: populatedUser.email,
      role: populatedUser.role,
      isVerified: populatedUser.isVerified,
      avatar: populatedUser.avatar,
      studentProfile: populatedUser.studentProfile,
      alumniProfile: populatedUser.alumniProfile,
      token: generateToken(populatedUser._id)
    });
  } catch (error) {
    console.error('Registration Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'Email or PRN';
      return res.status(400).json({ message: `An account with this ${field} already exists.` });
    }
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail })
      .select('+password')
      .populate('studentProfile')
      .populate('alumniProfile');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (role) {
      const cleanRole = role.trim().toLowerCase();
      if (user.role.toLowerCase() !== cleanRole) {
        return res.status(403).json({
          message: `Account exists as role '${user.role}'. Please select '${user.role}' to log in.`
        });
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
      studentProfile: user.studentProfile,
      alumniProfile: user.alumniProfile,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login Error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('studentProfile')
      .populate('alumniProfile');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
