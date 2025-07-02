// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Not authorized') {
    super(message, 403);
  }
}

// Database error
class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500);
  }
}

// Conflict error
class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

// Enhanced logging function
const logError = (err, req) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      isOperational: err.isOperational
    }
  };
  
  console.error('ERROR LOG:', JSON.stringify(errorLog, null, 2));
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log all errors
  logError(err, req);
  // Log the full error object for debugging
  console.error('FULL ERROR OBJECT:', err);

  // Development error response
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
  }
  // Production error response
  else {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        timestamp: new Date().toISOString()
      });
    } 
    // Programming or other unknown error: don't leak error details
    else {
      console.error('UNEXPECTED ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong. Please try again later.',
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Not found handler
const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  DatabaseError,
  ConflictError,
  errorHandler,
  notFoundHandler,
  asyncHandler
}; 