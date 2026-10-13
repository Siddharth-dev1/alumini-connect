
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests without an Origin header, such as server-to-server requests
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

// Connect to MongoDB
connectDB();

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Alumni Connect API is running'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Alumni Connect API Server Running'
  });
});

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profiles', require('./routes/profileRoutes'));
app.use('/api/directory', require('./routes/directoryRoutes'));
app.use('/api/connections', require('./routes/connectionRoutes'));
app.use('/api/mentorship', require('./routes/mentorshipRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/event-requests', require('./routes/eventRequestRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// Vercel detects and deploys this Express application.
module.exports = app;
