const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// More strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later'
});

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Security middleware setup
const securityMiddleware = [
  // Set security HTTP headers
  helmet(),
  
  // Enable CORS
  cors(corsOptions),
  
  // Data sanitization against XSS
  xss(),
  
  // Prevent parameter pollution
  hpp(),
  
  // Rate limiting
  limiter
];

// Auth routes specific security
const authSecurityMiddleware = [
  helmet(),
  cors(corsOptions),
  xss(),
  hpp(),
  authLimiter
];

module.exports = {
  securityMiddleware,
  authSecurityMiddleware
}; 