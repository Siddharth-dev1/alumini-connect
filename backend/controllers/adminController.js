const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const ConnectionRequest = require('../models/ConnectionRequest');
const MentorshipRequest = require('../models/MentorshipRequest');
const MentorshipSession = require('../models/MentorshipSession');
const Job = require('../models/Job');
const Event = require('../models/Event');
const EventRequest = require('../models/EventRequest');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');

// @desc    Get Platform Statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getPlatformStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAlumni = await User.countDocuments({ role: 'alumni' });
    const verifiedAlumni = await User.countDocuments({ role: 'alumni', isVerified: true });
    
    const pendingConnections = await ConnectionRequest.countDocuments({ status: 'pending' });
    const activeMentorships = await MentorshipSession.countDocuments({ status: 'Scheduled' });
    
    const totalJobs = await Job.countDocuments({ type: 'Job' });
    const totalInternships = await Job.countDocuments({ type: 'Internship' });
    const totalEvents = await Event.countDocuments();
    const pendingEventRequests = await EventRequest.countDocuments({ status: 'Pending' });
    const totalResources = await Resource.countDocuments();

    res.json({
      totalStudents,
      totalAlumni,
      verifiedAlumni,
      pendingConnections,
      activeMentorships,
      totalJobs,
      totalInternships,
      totalEvents,
      pendingEventRequests,
      totalResources
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Users with Filters
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const { role, isVerified, search } = req.query;

    let query = {};
    if (role) query.role = role;
    if (isVerified !== undefined && isVerified !== '') {
      query.isVerified = isVerified === 'true';
    }

    let users = await User.find(query)
      .populate('studentProfile')
      .populate('alumniProfile')
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      users = users.filter(u =>
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        (u.studentProfile && u.studentProfile.prn && u.studentProfile.prn.toLowerCase().includes(s)) ||
        (u.alumniProfile && u.alumniProfile.currentCompany && u.alumniProfile.currentCompany.toLowerCase().includes(s))
      );
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify or Unverify Alumni
// @route   PUT /api/admin/verify-alumni/:userId
// @access  Private (Admin)
const toggleAlumniVerification = async (req, res) => {
  try {
    const { isVerified } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = isVerified !== undefined ? isVerified : !user.isVerified;
    await user.save();

    // Create Notification for Alumni
    await Notification.create({
      recipient: user._id,
      sender: req.user._id,
      type: 'admin_announcement',
      title: user.isVerified ? 'Account Verified!' : 'Account Verification Status',
      message: user.isVerified
        ? 'Your alumni account has been officially verified by the University Administrator.'
        : 'Your alumni verification status has been updated by the Administrator.',
      relatedId: user._id.toString()
    });

    res.json({ message: `Alumni verification set to ${user.isVerified}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update User
// @route   PUT /api/admin/users/:userId
// @access  Private (Admin)
const updateUserByAdmin = async (req, res) => {
  try {
    const { name, email, role, isVerified } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isVerified !== undefined) user.isVerified = isVerified;

    await user.save();

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete User
// @route   DELETE /api/admin/users/:userId
// @access  Private (Admin)
const deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.studentProfile) await StudentProfile.findByIdAndDelete(user.studentProfile);
    if (user.alumniProfile) await AlumniProfile.findByIdAndDelete(user.alumniProfile);

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPlatformStats,
  getAllUsers,
  toggleAlumniVerification,
  updateUserByAdmin,
  deleteUserByAdmin
};
