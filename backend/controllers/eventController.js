const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Notification = require('../models/Notification');

// @desc    Create an Event
// @route   POST /api/events
// @access  Private (Alumni, Admin)
const createEvent = async (req, res) => {
  try {
    const { title, description, type, date, time, location, speaker, eligibility, maxParticipants, registrationDeadline, registrationLink } = req.body;

    if (!title || !description || !type || !date || !time || !location || !registrationDeadline) {
      return res.status(400).json({ message: 'Please provide all required event fields' });
    }

    const event = await Event.create({
      title,
      description,
      type,
      date,
      time,
      location,
      organizer: req.user._id,
      speaker: speaker || req.user.name,
      eligibility: eligibility || 'Open to all students',
      maxParticipants: Number(maxParticipants) || 100,
      registrationDeadline,
      registrationLink: registrationLink || ''
    });

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    const { search, type, status } = req.query;

    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    let events = await Event.find(query)
      .populate('organizer', 'name email role avatar')
      .sort({ date: 1 });

    if (search) {
      const s = search.toLowerCase();
      events = events.filter(e =>
        e.title.toLowerCase().includes(s) ||
        e.description.toLowerCase().includes(s) ||
        (e.speaker && e.speaker.toLowerCase().includes(s)) ||
        (e.location && e.location.toLowerCase().includes(s))
      );
    }

    // Attach registration count to each event
    const eventsWithStats = await Promise.all(
      events.map(async (ev) => {
        const registrationCount = await EventRegistration.countDocuments({ event: ev._id });
        let isUserRegistered = false;
        if (req.user) {
          const reg = await EventRegistration.findOne({ event: ev._id, user: req.user._id });
          isUserRegistered = !!reg;
        }
        return {
          ...ev.toObject(),
          registrationCount,
          isUserRegistered
        };
      })
    );

    res.json(eventsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Event by ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email role avatar');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registrationCount = await EventRegistration.countDocuments({ event: event._id });
    const isRegistered = !!(await EventRegistration.findOne({ event: event._id, user: req.user._id }));

    res.json({
      ...event.toObject(),
      registrationCount,
      isRegistered
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register for Event
// @route   POST /api/events/:id/register
// @access  Private (Student)
const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status === 'Completed' || event.status === 'Cancelled') {
      return res.status(400).json({ message: `Cannot register for an event that is ${event.status}` });
    }

    const currentRegs = await EventRegistration.countDocuments({ event: eventId });
    if (event.maxParticipants && currentRegs >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event registration is full' });
    }

    const existingReg = await EventRegistration.findOne({ event: eventId, user: userId });
    if (existingReg) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    const registration = await EventRegistration.create({
      event: eventId,
      user: userId
    });

    // Send Notification to Event Organizer
    await Notification.create({
      recipient: event.organizer,
      sender: userId,
      type: 'event_registration',
      title: 'New Event Registration',
      message: `${req.user.name} registered for your event "${event.title}".`,
      relatedId: event._id.toString()
    });

    res.status(201).json({ message: 'Successfully registered for event', registration });
  } catch (error) {
    console.error('Event Register Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel Event Registration
// @route   DELETE /api/events/:id/register
// @access  Private (Student)
const cancelEventRegistration = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const registration = await EventRegistration.findOneAndDelete({ event: eventId, user: userId });
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.json({ message: 'Event registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Event Registrations (List of participants)
// @route   GET /api/events/:id/registrations
// @access  Private (Organizer, Admin)
const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view participants' });
    }

    const registrations = await EventRegistration.find({ event: req.params.id })
      .populate({
        path: 'user',
        select: 'name email role avatar studentProfile',
        populate: { path: 'studentProfile' }
      })
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get My Registered Events
// @route   GET /api/events/my-registrations
// @access  Private (Student)
const getMyRegisteredEvents = async (req, res) => {
  try {
    const regs = await EventRegistration.find({ user: req.user._id })
      .populate({
        path: 'event',
        populate: { path: 'organizer', select: 'name email avatar' }
      })
      .sort({ createdAt: -1 });

    const registeredEvents = regs.map(r => r.event).filter(e => e !== null);
    res.json(registeredEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  registerForEvent,
  cancelEventRegistration,
  getEventRegistrations,
  getMyRegisteredEvents
};
