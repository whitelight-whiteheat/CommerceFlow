const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { ENV_CONFIG } = require('./constants');

/**
 * Configure all Express middleware
 */
const configureMiddleware = (app) => {
  // Trust proxy for Railway deployment
  app.set('trust proxy', 1);

  // Basic middleware
  app.use(cors({
    origin: ENV_CONFIG.CORS_ORIGIN,
    credentials: true
  }));
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Security middleware
  app.use(helmet());
  app.use(hpp());
  app.use(xss());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: ENV_CONFIG.RATE_LIMIT_WINDOW_MS,
    max: ENV_CONFIG.RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Logging middleware
  app.use(morgan(ENV_CONFIG.LOG_FORMAT));
};

module.exports = { configureMiddleware }; 