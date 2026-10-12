const EventRequest = require('../models/EventRequest');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// @desc    Submit an Event Request
// @route   POST /api/event-requests
// @access  Private (Student, Alumni)
const submitEventRequest = async (req, res) => {
  try {
    const { title, description, proposedDate, eventType, reason, expectedParticipants } = req.body;

    if (!title || !description || !proposedDate || !eventType || !reason) {
      return res.status(400).json({ message: 'Please fill out all required fields' });
    }

    const eventRequest = await EventRequest.create({
      requestedBy: req.user._id,
      title,
      description,
      proposedDate,
      eventType,
      reason,
      expectedParticipants: Number(expectedParticipants) || 50
    });

    res.status(201).json({ message: 'Event request submitted for admin approval', eventRequest });
  } catch (error) {
    console.error('Submit Event Request Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Event Requests
// @route   GET /api/event-requests
// @access  Private
const getEventRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.requestedBy = req.user._id;
    }

    const requests = await EventRequest.find(query)
      .populate('requestedBy', 'name email role avatar')
      .populate('createdEvent')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Respond to Event Request (Approve/Reject)
// @route   PUT /api/event-requests/:id/respond
// @access  Private (Admin)
const respondEventRequest = async (req, res) => {
  try {
    const { status, adminRemarks, time, location } = req.body;
    const requestId = req.params.id;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await EventRequest.findById(requestId).populate('requestedBy');
    if (!request) {
      return res.status(404).json({ message: 'Event request not found' });
    }

    request.status = status;
    request.adminRemarks = adminRemarks || '';

    let createdEvent = null;

    if (status === 'Approved') {
      // Automatically create actual Event
      createdEvent = await Event.create({
        title: request.title,
        description: request.description,
        type: request.eventType,
        date: request.proposedDate,
        time: time || '10:00 AM',
        location: location || 'Campus Main Auditorium / Zoom Link',
        organizer: request.requestedBy._id,
        speaker: request.requestedBy.name,
        maxParticipants: request.expectedParticipants,
        registrationDeadline: new Date(new Date(request.proposedDate).getTime() - 24 * 60 * 60 * 1000)
      });

      request.createdEvent = createdEvent._id;
    }

    await request.save();

    // Send Notification to Requester
    const notifType = status === 'Approved' ? 'event_request_approved' : 'event_request_rejected';
    const notifTitle = status === 'Approved' ? 'Event Request Approved!' : 'Event Request Update';
    const notifMsg = status === 'Approved'
      ? `Your event request "${request.title}" has been approved and created on the platform.`
      : `Your event request "${request.title}" was rejected by admin. Remarks: ${adminRemarks || 'None'}`;

    await Notification.create({
      recipient: request.requestedBy._id,
      sender: req.user._id,
      type: notifType,
      title: notifTitle,
      message: notifMsg,
      relatedId: request._id.toString()
    });

    res.json({ message: `Event request ${status}`, request, createdEvent });
  } catch (error) {
    console.error('Respond Event Request Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitEventRequest,
  getEventRequests,
  respondEventRequest
};
