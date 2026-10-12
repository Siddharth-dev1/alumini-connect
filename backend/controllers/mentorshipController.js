const MentorshipRequest = require('../models/MentorshipRequest');
const MentorshipSession = require('../models/MentorshipSession');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Submit Mentorship Request
// @route   POST /api/mentorship/request
// @access  Private (Student)
const createMentorshipRequest = async (req, res) => {
  try {
    const { alumniId, topic, message, preferredDate, preferredTime } = req.body;
    const studentId = req.user._id;

    if (!alumniId || !topic || !message || !preferredDate || !preferredTime) {
      return res.status(400).json({ message: 'Please fill out all required fields' });
    }

    const alumni = await User.findById(alumniId);
    if (!alumni || alumni.role !== 'alumni') {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    const mentorshipRequest = await MentorshipRequest.create({
      student: studentId,
      alumni: alumniId,
      topic,
      message,
      preferredDate,
      preferredTime,
      status: 'Pending'
    });

    // Notify Alumni
    await Notification.create({
      recipient: alumniId,
      sender: studentId,
      type: 'mentorship_request',
      title: 'New Mentorship Request',
      message: `${req.user.name} requested 1-on-1 mentorship on "${topic}".`,
      relatedId: mentorshipRequest._id.toString()
    });

    res.status(201).json({ message: 'Mentorship request submitted successfully', mentorshipRequest });
  } catch (error) {
    console.error('Mentorship Request Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Mentorship Requests for logged in User (Student or Alumni)
// @route   GET /api/mentorship/my-requests
// @access  Private
const getMyMentorshipRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    let query = {};

    if (req.user.role === 'student') {
      query.student = userId;
    } else if (req.user.role === 'alumni') {
      query.alumni = userId;
    } else {
      // Admin sees all
      query = {};
    }

    const requests = await MentorshipRequest.find(query)
      .populate({
        path: 'student',
        select: 'name email avatar studentProfile',
        populate: { path: 'studentProfile' }
      })
      .populate({
        path: 'alumni',
        select: 'name email avatar alumniProfile',
        populate: { path: 'alumniProfile' }
      })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Respond to Mentorship Request (Accept, Reject, Reschedule)
// @route   PUT /api/mentorship/respond
// @access  Private (Alumni/Admin)
const respondMentorshipRequest = async (req, res) => {
  try {
    const { requestId, status, responseMessage, meetingLink, scheduledDate, scheduledTime } = req.body;

    const request = await MentorshipRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Mentorship request not found' });
    }

    const isAlumni = request.alumni.toString() === req.user._id.toString();
    const isStudent = request.student.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAlumni && !isStudent && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to respond to this mentorship request' });
    }

    request.status = status;
    if (responseMessage) request.responseMessage = responseMessage;
    if (meetingLink) request.meetingLink = meetingLink;
    if (scheduledDate) request.preferredDate = scheduledDate;
    if (scheduledTime) request.preferredTime = scheduledTime;

    await request.save();

    let session = null;
    if (status === 'Accepted' || status === 'Scheduled') {
      // Create Mentorship Session
      const sessionDate = scheduledDate ? new Date(scheduledDate) : new Date(request.preferredDate);
      session = await MentorshipSession.create({
        request: request._id,
        student: request.student,
        alumni: request.alumni,
        topic: request.topic,
        date: sessionDate,
        time: scheduledTime || request.preferredTime,
        meetingLink: meetingLink || 'https://meet.google.com/xyz-alumni-connect',
        status: 'Scheduled'
      });
    }

    // Send Notification to Student
    const notifType = status === 'Accepted' || status === 'Scheduled' ? 'mentorship_accepted' : 'mentorship_rejected';
    const notifTitle = status === 'Accepted' || status === 'Scheduled' ? 'Mentorship Request Accepted!' : 'Mentorship Request Update';
    const notifMsg = status === 'Accepted' || status === 'Scheduled'
      ? `${req.user.name} accepted your mentorship request for "${request.topic}".`
      : `${req.user.name} declined your mentorship request.`;

    await Notification.create({
      recipient: request.student,
      sender: req.user._id,
      type: notifType,
      title: notifTitle,
      message: notifMsg,
      relatedId: request._id.toString()
    });

    res.json({ message: `Mentorship request updated to ${status}`, request, session });
  } catch (error) {
    console.error('Respond Mentorship Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Mentorship Sessions
// @route   GET /api/mentorship/sessions
// @access  Private
const getMentorshipSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    let query = {};

    if (req.user.role === 'student') {
      query.student = userId;
    } else if (req.user.role === 'alumni') {
      query.alumni = userId;
    }

    const sessions = await MentorshipSession.find(query)
      .populate('student', 'name email avatar')
      .populate('alumni', 'name email avatar')
      .populate('request')
      .sort({ date: 1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Mentorship Session Status
// @route   PUT /api/mentorship/sessions/:id/status
// @access  Private
const updateSessionStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const session = await MentorshipSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Mentorship session not found' });
    }

    session.status = status || session.status;
    if (notes) session.notes = notes;
    await session.save();

    res.json({ message: 'Session status updated', session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMentorshipRequest,
  getMyMentorshipRequests,
  respondMentorshipRequest,
  getMentorshipSessions,
  updateSessionStatus
};
