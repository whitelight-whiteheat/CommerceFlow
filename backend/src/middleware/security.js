const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

// Rate limiting configurations
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// More strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many login attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// API limiter for general API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    status: 'error',
    message: 'API rate limit exceeded, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// CORS configuration with enhanced security
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'https://localhost:3000'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200
};

// Enhanced Helmet configuration
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
};

// Security middleware setup
const securityMiddleware = [
  // Set security HTTP headers with enhanced configuration
  helmet(helmetConfig),
  
  // Enable CORS with enhanced security
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
  helmet(helmetConfig),
  cors(corsOptions),
  xss(),
  hpp(),
  authLimiter
];

// API routes security
const apiSecurityMiddleware = [
  helmet(helmetConfig),
  cors(corsOptions),
  xss(),
  hpp(),
  apiLimiter
];

// Additional security utilities
const securityUtils = {
  // Sanitize user input
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim();
  },

  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Check for SQL injection patterns
  hasSqlInjection: (input) => {
    if (typeof input !== 'string') return false;
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\b\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
      /(--|\/\*|\*\/|xp_|sp_)/i
    ];
    return sqlPatterns.some(pattern => pattern.test(input));
  },

  // Generate secure random string
  generateSecureToken: (length = 32) => {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
  }
};

module.exports = {
  securityMiddleware,
  authSecurityMiddleware,
  apiSecurityMiddleware,
  securityUtils,
  corsOptions,
  helmetConfig
}; 