// CardioSentinel Remote - Backend Server
// MERN Stack Application

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// =====================
// MIDDLEWARE SETUP
// =====================

app.use(morgan('dev'));

app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// DATABASE CONNECTION
// =====================

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// =====================
// ROUTES
// =====================

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/telemetry', require('./routes/telemetryRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/predictions', require('./routes/predictionRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/patient-portal', require('./routes/patientPortalRoutes'));

// =====================
// HEALTH CHECK
// =====================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'CardioSentinel Backend'
  });
});

// 404 handler — must come after all routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// =====================
// CENTRALIZED ERROR HANDLER
// =====================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Validation error', errors: messages });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `Duplicate value for ${field}` });
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// =====================
// SERVER STARTUP
// =====================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`CardioSentinel Backend running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();

module.exports = app;
