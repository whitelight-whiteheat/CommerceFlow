/**
 * Error Handling Configuration
 * 
 * Centralized error handling with standardized error codes and messages.
 */

/**
 * Error Codes Enum
 */
const ErrorCodes = {
  // Authentication Errors (1000-1099)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation Errors (1100-1199)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resource Errors (1200-1299)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND',
  
  // Business Logic Errors (1300-1399)
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  CART_EMPTY: 'CART_EMPTY',
  ORDER_ALREADY_PROCESSED: 'ORDER_ALREADY_PROCESSED',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  DUPLICATE_CATEGORY: 'DUPLICATE_CATEGORY',
  
  // Database Errors (1400-1499)
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  QUERY_ERROR: 'QUERY_ERROR',
  TRANSACTION_ERROR: 'TRANSACTION_ERROR',
  
  // External Service Errors (1500-1599)
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  PAYMENT_GATEWAY_ERROR: 'PAYMENT_GATEWAY_ERROR',
  EMAIL_SERVICE_ERROR: 'EMAIL_SERVICE_ERROR',
  
  // System Errors (1600-1699)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};

/**
 * HTTP Status Codes Mapping
 */
const StatusCodes = {
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.INVALID_TOKEN]: 401,
  [ErrorCodes.TOKEN_EXPIRED]: 401,
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCodes.VALIDATION_ERROR]: 400,
  [ErrorCodes.INVALID_EMAIL]: 400,
  [ErrorCodes.INVALID_PASSWORD]: 400,
  [ErrorCodes.INVALID_INPUT]: 400,
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.RESOURCE_NOT_FOUND]: 404,
  [ErrorCodes.USER_NOT_FOUND]: 404,
  [ErrorCodes.PRODUCT_NOT_FOUND]: 404,
  [ErrorCodes.ORDER_NOT_FOUND]: 404,
  [ErrorCodes.CATEGORY_NOT_FOUND]: 404,
  [ErrorCodes.INSUFFICIENT_STOCK]: 400,
  [ErrorCodes.CART_EMPTY]: 400,
  [ErrorCodes.ORDER_ALREADY_PROCESSED]: 400,
  [ErrorCodes.DUPLICATE_EMAIL]: 409,
  [ErrorCodes.DUPLICATE_CATEGORY]: 409,
  [ErrorCodes.DATABASE_ERROR]: 500,
  [ErrorCodes.CONNECTION_ERROR]: 500,
  [ErrorCodes.QUERY_ERROR]: 500,
  [ErrorCodes.TRANSACTION_ERROR]: 500,
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCodes.PAYMENT_GATEWAY_ERROR]: 502,
  [ErrorCodes.EMAIL_SERVICE_ERROR]: 502,
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCodes.CONFIGURATION_ERROR]: 500,
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCodes.SERVICE_UNAVAILABLE]: 503
};

/**
 * Default Error Messages
 */
const ErrorMessages = {
  [ErrorCodes.UNAUTHORIZED]: 'Authentication required',
  [ErrorCodes.INVALID_TOKEN]: 'Invalid authentication token',
  [ErrorCodes.TOKEN_EXPIRED]: 'Authentication token has expired',
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions to perform this action',
  [ErrorCodes.VALIDATION_ERROR]: 'Validation failed',
  [ErrorCodes.INVALID_EMAIL]: 'Invalid email format',
  [ErrorCodes.INVALID_PASSWORD]: 'Invalid password format',
  [ErrorCodes.INVALID_INPUT]: 'Invalid input provided',
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 'Required field is missing',
  [ErrorCodes.NOT_FOUND]: 'Resource not found',
  [ErrorCodes.RESOURCE_NOT_FOUND]: 'The requested resource was not found',
  [ErrorCodes.USER_NOT_FOUND]: 'User not found',
  [ErrorCodes.PRODUCT_NOT_FOUND]: 'Product not found',
  [ErrorCodes.ORDER_NOT_FOUND]: 'Order not found',
  [ErrorCodes.CATEGORY_NOT_FOUND]: 'Category not found',
  [ErrorCodes.INSUFFICIENT_STOCK]: 'Insufficient stock available',
  [ErrorCodes.CART_EMPTY]: 'Shopping cart is empty',
  [ErrorCodes.ORDER_ALREADY_PROCESSED]: 'Order has already been processed',
  [ErrorCodes.DUPLICATE_EMAIL]: 'Email address is already in use',
  [ErrorCodes.DUPLICATE_CATEGORY]: 'Category name already exists',
  [ErrorCodes.DATABASE_ERROR]: 'Database operation failed',
  [ErrorCodes.CONNECTION_ERROR]: 'Database connection failed',
  [ErrorCodes.QUERY_ERROR]: 'Database query failed',
  [ErrorCodes.TRANSACTION_ERROR]: 'Database transaction failed',
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 'External service error',
  [ErrorCodes.PAYMENT_GATEWAY_ERROR]: 'Payment gateway error',
  [ErrorCodes.EMAIL_SERVICE_ERROR]: 'Email service error',
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 'Internal server error',
  [ErrorCodes.CONFIGURATION_ERROR]: 'Configuration error',
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable'
};

/**
 * Custom Error Class
 */
class AppError extends Error {
  constructor(code, message = null, details = null, statusCode = null) {
    super(message || ErrorMessages[code] || 'An error occurred');
    
    this.name = 'AppError';
    this.code = code;
    this.message = message || ErrorMessages[code] || 'An error occurred';
    this.details = details;
    this.statusCode = statusCode || StatusCodes[code] || 500;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * Convert error to JSON response format
   */
  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp
      }
    };
  }
  
  /**
   * Create error from Prisma error
   */
  static fromPrismaError(error) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      const field = error.meta?.target?.[0] || 'field';
      return new AppError(
        ErrorCodes.DUPLICATE_EMAIL,
        `${field} already exists`,
        { field, value: error.meta?.target }
      );
    }
    
    if (error.code === 'P2025') {
      // Record not found
      return new AppError(
        ErrorCodes.RESOURCE_NOT_FOUND,
        'Resource not found',
        { model: error.meta?.model }
      );
    }
    
    if (error.code === 'P2003') {
      // Foreign key constraint violation
      return new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'Referenced resource does not exist',
        { field: error.meta?.field_name }
      );
    }
    
    // Default database error
    return new AppError(
      ErrorCodes.DATABASE_ERROR,
      'Database operation failed',
      { code: error.code, message: error.message }
    );
  }
  
  /**
   * Create validation error
   */
  static validationError(details) {
    return new AppError(
      ErrorCodes.VALIDATION_ERROR,
      'Validation failed',
      details
    );
  }
  
  /**
   * Create not found error
   */
  static notFound(resource = 'Resource') {
    return new AppError(
      ErrorCodes.NOT_FOUND,
      `${resource} not found`
    );
  }
  
  /**
   * Create unauthorized error
   */
  static unauthorized(message = null) {
    return new AppError(
      ErrorCodes.UNAUTHORIZED,
      message
    );
  }
  
  /**
   * Create forbidden error
   */
  static forbidden(message = null) {
    return new AppError(
      ErrorCodes.INSUFFICIENT_PERMISSIONS,
      message
    );
  }
}

/**
 * Error Handler Factory
 */
class ErrorHandler {
  constructor(logger = console) {
    this.logger = logger;
  }
  
  /**
   * Handle error and send appropriate response
   */
  handle(error, req, res, next) {
    let appError;
    
    // Convert to AppError if not already
    if (error instanceof AppError) {
      appError = error;
    } else if (error.name === 'PrismaClientKnownRequestError') {
      appError = AppError.fromPrismaError(error);
    } else if (error.name === 'ValidationError') {
      appError = AppError.validationError(error.details);
    } else if (error.name === 'JsonWebTokenError') {
      appError = new AppError(ErrorCodes.INVALID_TOKEN);
    } else if (error.name === 'TokenExpiredError') {
      appError = new AppError(ErrorCodes.TOKEN_EXPIRED);
    } else {
      // Unknown error
      appError = new AppError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'An unexpected error occurred'
      );
    }
    
    // Log error
    this.logError(appError, req);
    
    // Send error response
    res.status(appError.statusCode).json(appError.toJSON());
  }
  
  /**
   * Log error with context
   */
  logError(error, req) {
    const logData = {
      timestamp: error.timestamp,
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      url: req?.url,
      method: req?.method,
      ip: req?.ip,
      userAgent: req?.get('User-Agent'),
      userId: req?.user?.id,
      details: error.details
    };
    
    if (error.statusCode >= 500) {
      this.logger.error('Server Error:', logData);
    } else if (error.statusCode >= 400) {
      this.logger.warn('Client Error:', logData);
    } else {
      this.logger.info('Application Error:', logData);
    }
  }
  
  /**
   * Handle async errors
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
  
  /**
   * Handle 404 errors
   */
  handleNotFound(req, res) {
    const error = AppError.notFound('Route');
    res.status(404).json(error.toJSON());
  }
}

/**
 * Validation error formatter
 */
function formatValidationErrors(errors) {
  const details = {};
  
  if (Array.isArray(errors)) {
    errors.forEach(error => {
      if (error.path) {
        details[error.path] = [error.message];
      }
    });
  } else if (typeof errors === 'object') {
    Object.keys(errors).forEach(key => {
      details[key] = Array.isArray(errors[key]) ? errors[key] : [errors[key]];
    });
  }
  
  return details;
}

module.exports = {
  ErrorCodes,
  StatusCodes,
  ErrorMessages,
  AppError,
  ErrorHandler,
  formatValidationErrors
}; 