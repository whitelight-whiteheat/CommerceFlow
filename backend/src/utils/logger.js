const { ENV_CONFIG } = require('../config/constants');

class Logger {
  static error(message, error = null, context = {}) {
    const logData = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      context
    };

    if (error) {
      logData.error = {
        name: error.name,
        message: error.message,
        stack: ENV_CONFIG.NODE_ENV === 'development' ? error.stack : undefined
      };
    }

    // In production, you might want to send this to a logging service
    if (ENV_CONFIG.NODE_ENV === 'production') {
      // TODO: Send to logging service (e.g., Winston, Bunyan, etc.)
      console.error(JSON.stringify(logData));
    } else {
      console.error(`[ERROR] ${message}`, error ? error.message : '');
    }
  }

  static warn(message, context = {}) {
    const logData = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      context
    };

    if (ENV_CONFIG.NODE_ENV === 'production') {
      console.warn(JSON.stringify(logData));
    } else {
      console.warn(`[WARN] ${message}`);
    }
  }

  static info(message, context = {}) {
    const logData = {
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      context
    };

    if (ENV_CONFIG.NODE_ENV === 'production') {
      console.log(JSON.stringify(logData));
    } else {
      console.log(`[INFO] ${message}`);
    }
  }

  static debug(message, context = {}) {
    if (ENV_CONFIG.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, context);
    }
  }
}

module.exports = Logger; 