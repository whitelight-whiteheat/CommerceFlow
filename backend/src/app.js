const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import configuration modules
const { configureMiddleware } = require('./config/middleware');
const { configureSwagger } = require('./config/swagger');
const { configureRoutes } = require('./config/routes');
const { configureErrorHandling } = require('./config/errorHandling');

/**
 * Create and configure Express application
 */
const createApp = () => {
  const app = express();

  // Configure middleware
  configureMiddleware(app);

  // Configure Swagger documentation
  configureSwagger(app);

  // Configure routes
  configureRoutes(app);

  // Configure error handling (must be last)
  configureErrorHandling(app);

  return app;
};

// Create the app instance
const app = createApp();

module.exports = app;