const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const ConnectionRequest = require('../models/ConnectionRequest');
const MentorshipRequest = require('../models/MentorshipRequest');
const MentorshipSession = require('../models/MentorshipSession');
const Job = require('../models/Job');
const Event = require('../models/Event');
const EventRequest = require('../models/EventRequest');
const EventRegistration = require('../models/EventRegistration');
const Resource = require('../models/Resource');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

dotenv.config();

const clearData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/alumniconnect';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB. Clearing all dummy data...');

    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await AlumniProfile.deleteMany({});
    await ConnectionRequest.deleteMany({});
    await MentorshipRequest.deleteMany({});
    await MentorshipSession.deleteMany({});
    await Job.deleteMany({});
    await Event.deleteMany({});
    await EventRequest.deleteMany({});
    await EventRegistration.deleteMany({});
    await Resource.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});

    console.log('All dummy data successfully cleared from database.');

    // Create single clean System Admin account for platform management
    const adminUser = new User({
      name: 'System Admin',
      email: 'admin@alumniconnect.com',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true
    });
    await adminUser.save();
    console.log('Created default System Admin account (admin@alumniconnect.com / Admin@123)');

    process.exit(0);
  } catch (error) {
    console.error('Clear Data Error:', error);
    process.exit(1);
  }
};

clearData();
