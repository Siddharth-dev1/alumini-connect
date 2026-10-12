const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create Job / Internship / Training Program
// @route   POST /api/jobs
// @access  Private (Alumni, Admin)
const createJob = async (req, res) => {
  try {
    const { title, company, description, type, location, employmentType, skillsRequired, eligibility, salaryOrStipend, deadline, applicationLink } = req.body;

    if (!title || !company || !description || !location || !deadline) {
      return res.status(400).json({ message: 'Please provide all required job fields' });
    }

    const job = await Job.create({
      title,
      company,
      description,
      type: type || 'Job',
      location,
      employmentType: employmentType || 'Full-time',
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : (skillsRequired ? skillsRequired.split(',').map(s => s.trim()) : []),
      eligibility: eligibility || 'All Graduates',
      salaryOrStipend: salaryOrStipend || 'Not disclosed',
      deadline,
      applicationLink: applicationLink || '',
      postedBy: req.user._id
    });

    res.status(201).json({ message: 'Opportunity posted successfully', job });
  } catch (error) {
    console.error('Create Job Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Jobs / Internships with filters
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res) => {
  try {
    const { search, type, employmentType, location } = req.query;

    let query = { status: 'Active' };

    if (type) {
      query.type = type;
    }
    if (employmentType) {
      query.employmentType = employmentType;
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    let jobs = await Job.find(query)
      .populate('postedBy', 'name email role avatar alumniProfile')
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      jobs = jobs.filter(j => 
        j.title.toLowerCase().includes(s) ||
        j.company.toLowerCase().includes(s) ||
        j.description.toLowerCase().includes(s) ||
        (j.skillsRequired && j.skillsRequired.some(sk => sk.toLowerCase().includes(s)))
      );
    }

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Job by ID
// @route   GET /api/jobs/:id
// @access  Private
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email role avatar');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Job
// @route   PUT /api/jobs/:id
// @access  Private (Alumni Poster, Admin)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this job posting' });
    }

    Object.assign(job, req.body);
    await job.save();

    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Job
// @route   DELETE /api/jobs/:id
// @access  Private (Alumni Poster, Admin)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job posting' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply to Job / Internship
// @route   POST /api/jobs/:id/apply
// @access  Private (Student)
const applyToJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const studentId = req.user._id;
    const { resumeUrl, coverNote } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    const existingApp = await Application.findOne({ job: jobId, applicant: studentId });
    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this position' });
    }

    const application = await Application.create({
      job: jobId,
      applicant: studentId,
      resumeUrl: resumeUrl || '',
      coverNote: coverNote || ''
    });

    // Send notification to job poster
    await Notification.create({
      recipient: job.postedBy,
      sender: studentId,
      type: 'job_posted',
      title: 'New Job Application',
      message: `${req.user.name} applied for "${job.title}" at ${job.company}.`,
      relatedId: application._id.toString()
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    console.error('Job Apply Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Applications for a Job
// @route   GET /api/jobs/:id/applications
// @access  Private (Poster, Admin)
const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view applications for this job' });
    }

    const applications = await Application.find({ job: req.params.id })
      .populate({
        path: 'applicant',
        select: 'name email role avatar studentProfile',
        populate: { path: 'studentProfile' }
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get My Job Applications (Student)
// @route   GET /api/jobs/my-applications
// @access  Private (Student)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: 'job',
        populate: { path: 'postedBy', select: 'name company' }
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Application Status (Shortlisted, Rejected, Selected, etc.)
// @route   PUT /api/jobs/applications/:appId/status
// @access  Private (Poster, Admin)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.appId).populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (req.user.role !== 'admin' && application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    // Notify Applicant
    await Notification.create({
      recipient: application.applicant,
      sender: req.user._id,
      type: 'admin_announcement',
      title: 'Application Status Update',
      message: `Your application for "${application.job.title}" is now: ${status}.`,
      relatedId: application._id.toString()
    });

    res.json({ message: `Application status updated to ${status}`, application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyToJob,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus
};
