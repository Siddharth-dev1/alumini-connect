const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');

// @desc    Get Student Profile by User ID
// @route   GET /api/profiles/student/:userId
// @access  Private
const getStudentProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.params.userId }).populate('user', 'name email role avatar isVerified');
    if (!profile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Alumni Profile by User ID
// @route   GET /api/profiles/alumni/:userId
// @access  Private
const getAlumniProfile = async (req, res) => {
  try {
    const profile = await AlumniProfile.findOne({ user: req.params.userId }).populate('user', 'name email role avatar isVerified');
    if (!profile) {
      return res.status(404).json({ message: 'Alumni profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Student Profile
// @route   PUT /api/profiles/student
// @access  Private (Student)
const updateStudentProfile = async (req, res) => {
  try {
    const { name, avatar, phone, prn, department, batch, skills, interests, bio, careerGoals, education, projects, socialLinks } = req.body;

    // Update User model fields
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();

    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new StudentProfile({ user: req.user._id, prn: prn || 'PRN000', department: department || 'CSBS', batch: batch || '2026' });
    }

    if (prn) profile.prn = prn;
    if (department) profile.department = department;
    if (batch) profile.batch = batch;
    if (phone !== undefined) profile.phone = phone;
    if (bio !== undefined) profile.bio = bio;
    if (careerGoals !== undefined) profile.careerGoals = careerGoals;
    
    if (skills) {
      profile.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    }
    if (interests) {
      profile.interests = Array.isArray(interests) ? interests : interests.split(',').map(s => s.trim());
    }
    if (education) profile.education = education;
    if (projects) profile.projects = projects;
    if (socialLinks) profile.socialLinks = { ...profile.socialLinks, ...socialLinks };

    await profile.save();

    const updatedUser = await User.findById(req.user._id).populate('studentProfile');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Alumni Profile
// @route   PUT /api/profiles/alumni
// @access  Private (Alumni)
const updateAlumniProfile = async (req, res) => {
  try {
    const { name, avatar, phone, graduationYear, department, currentCompany, jobTitle, industry, location, skills, expertise, bio, education, experience, achievements, socialLinks } = req.body;

    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();

    let profile = await AlumniProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new AlumniProfile({
        user: req.user._id,
        graduationYear: graduationYear || 2024,
        department: department || 'CSBS',
        currentCompany: currentCompany || 'Company',
        jobTitle: jobTitle || 'Engineer',
        industry: industry || 'Tech',
        location: location || 'Pune'
      });
    }

    if (graduationYear) profile.graduationYear = graduationYear;
    if (department) profile.department = department;
    if (currentCompany) profile.currentCompany = currentCompany;
    if (jobTitle) profile.jobTitle = jobTitle;
    if (industry) profile.industry = industry;
    if (location) profile.location = location;
    if (phone !== undefined) profile.phone = phone;
    if (bio !== undefined) profile.bio = bio;

    if (skills) {
      profile.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    }
    if (expertise) {
      profile.expertise = Array.isArray(expertise) ? expertise : expertise.split(',').map(e => e.trim());
    }
    if (education) profile.education = education;
    if (experience) profile.experience = experience;
    if (achievements) profile.achievements = achievements;
    if (socialLinks) profile.socialLinks = { ...profile.socialLinks, ...socialLinks };

    await profile.save();

    const updatedUser = await User.findById(req.user._id).populate('alumniProfile');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentProfile,
  getAlumniProfile,
  updateStudentProfile,
  updateAlumniProfile
};
