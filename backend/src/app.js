// backend/src/app.js - REMOVE activity routes
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const passport = require('./config/passport');
const errorHandler = require('./middleware/errorHandler.middleware');

// Safe logger import
let logger;
try {
  const loggerUtil = require('./utils/logger.util');
  logger = loggerUtil.logger || console;
} catch (error) {
  logger = console;
}

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const riskRoutes = require('./routes/risk.routes');
const policyRoutes = require('./routes/policy.routes');
const claimRoutes = require('./routes/claim.routes');
const adminRoutes = require('./routes/admin.routes');
const insuranceRoutes = require('./routes/insurance.routes');
// REMOVE THIS LINE: const activityRoutes = require('./routes/activity.routes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - FIXED
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174'
    ];
    
    // Add any FRONTEND_URL from environment variable
    if (process.env.FRONTEND_URL) {
      const envUrls = process.env.FRONTEND_URL.split(',');
      allowedOrigins.push(...envUrls);
    }
    
    // In development, be more permissive
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging - Safe version
app.use(morgan('dev')); // Changed to simple format to avoid logger issues

// Initialize passport
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/insurance', insuranceRoutes);
// REMOVE THIS LINE: app.use('/api/activities', activityRoutes);

// Health check
app.get('/health', (req, res) => {
  logger.info(`Health check requested from ${req.ip}`);
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Financial Risk Insurance API'
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn(`404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler (should be last)
app.use(errorHandler);

module.exports = app;