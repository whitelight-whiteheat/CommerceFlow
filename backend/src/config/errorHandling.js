const { logger } = require('../utils/logger');
const { ErrorHandler, AppError } = require('./errors');

/**
 * Configure error handling middleware
 */
const configureErrorHandling = (app) => {
  const errorHandler = new ErrorHandler(logger);

  // 404 handler - must be last before error handler
  app.use('*', (req, res) => {
    errorHandler.handleNotFound(req, res);
  });

  // Global error handling middleware - must be last
  app.use((error, req, res, next) => {
    errorHandler.handle(error, req, res, next);
  });
};

module.exports = { configureErrorHandling }; 