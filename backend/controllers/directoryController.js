const User = require('../models/User');
const AlumniProfile = require('../models/AlumniProfile');
const StudentProfile = require('../models/StudentProfile');

// @desc    Search and filter Alumni Directory
// @route   GET /api/directory/alumni
// @access  Private
const searchAlumni = async (req, res) => {
  try {
    const { search, department, graduationYear, industry, company, skill, location, isVerified } = req.query;

    let profileFilter = {};

    if (department) {
      profileFilter.department = { $regex: department, $options: 'i' };
    }
    if (graduationYear) {
      profileFilter.graduationYear = Number(graduationYear);
    }
    if (industry) {
      profileFilter.industry = { $regex: industry, $options: 'i' };
    }
    if (company) {
      profileFilter.currentCompany = { $regex: company, $options: 'i' };
    }
    if (location) {
      profileFilter.location = { $regex: location, $options: 'i' };
    }
    if (skill) {
      profileFilter.skills = { $in: [new RegExp(skill, 'i')] };
    }

    let alumniProfiles = await AlumniProfile.find(profileFilter).populate({
      path: 'user',
      select: 'name email avatar role isVerified'
    });

    // Filter out profiles whose associated user does not exist or matches search query
    let results = alumniProfiles.filter(p => p.user !== null);

    if (isVerified !== undefined && isVerified !== '') {
      const targetVerified = isVerified === 'true';
      results = results.filter(p => p.user.isVerified === targetVerified);
    }

    if (search) {
      const s = search.toLowerCase();
      results = results.filter(p => 
        (p.user && p.user.name.toLowerCase().includes(s)) ||
        (p.currentCompany && p.currentCompany.toLowerCase().includes(s)) ||
        (p.jobTitle && p.jobTitle.toLowerCase().includes(s)) ||
        (p.industry && p.industry.toLowerCase().includes(s)) ||
        (p.location && p.location.toLowerCase().includes(s)) ||
        (p.skills && p.skills.some(sk => sk.toLowerCase().includes(s))) ||
        (p.expertise && p.expertise.some(ex => ex.toLowerCase().includes(s)))
      );
    }

    res.json(results);
  } catch (error) {
    console.error('Search Alumni Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search and filter Student Directory
// @route   GET /api/directory/students
// @access  Private
const searchStudents = async (req, res) => {
  try {
    const { search, department, batch, skill } = req.query;

    let profileFilter = {};
    if (department) {
      profileFilter.department = { $regex: department, $options: 'i' };
    }
    if (batch) {
      profileFilter.batch = { $regex: batch, $options: 'i' };
    }
    if (skill) {
      profileFilter.skills = { $in: [new RegExp(skill, 'i')] };
    }

    let studentProfiles = await StudentProfile.find(profileFilter).populate({
      path: 'user',
      select: 'name email avatar role isVerified'
    });

    let results = studentProfiles.filter(p => p.user !== null);

    if (search) {
      const s = search.toLowerCase();
      results = results.filter(p =>
        (p.user && p.user.name.toLowerCase().includes(s)) ||
        (p.prn && p.prn.toLowerCase().includes(s)) ||
        (p.department && p.department.toLowerCase().includes(s)) ||
        (p.skills && p.skills.some(sk => sk.toLowerCase().includes(s))) ||
        (p.interests && p.interests.some(it => it.toLowerCase().includes(s)))
      );
    }

    res.json(results);
  } catch (error) {
    console.error('Search Students Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  searchAlumni,
  searchStudents
};
