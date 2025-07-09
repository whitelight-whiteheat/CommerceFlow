/**
 * Monitoring Configuration
 * 
 * Centralized configuration for application monitoring, metrics, and alerting.
 */

/**
 * Application Metrics Configuration
 */
export const metricsConfig = {
  // Performance metrics
  performance: {
    responseTime: {
      enabled: true,
      threshold: 2000, // 2 seconds
      alertThreshold: 5000 // 5 seconds
    },
    throughput: {
      enabled: true,
      window: 60000, // 1 minute
      alertThreshold: 1000 // requests per minute
    },
    errorRate: {
      enabled: true,
      threshold: 0.05, // 5%
      alertThreshold: 0.10 // 10%
    }
  },
  
  // Database metrics
  database: {
    connectionPool: {
      enabled: true,
      maxConnections: 20,
      alertThreshold: 0.8 // 80% utilization
    },
    queryPerformance: {
      enabled: true,
      slowQueryThreshold: 1000, // 1 second
      alertThreshold: 5000 // 5 seconds
    },
    deadlocks: {
      enabled: true,
      alertThreshold: 1 // any deadlock
    }
  },
  
  // Memory and CPU metrics
  system: {
    memory: {
      enabled: true,
      threshold: 0.8, // 80% utilization
      alertThreshold: 0.9 // 90% utilization
    },
    cpu: {
      enabled: true,
      threshold: 0.7, // 70% utilization
      alertThreshold: 0.9 // 90% utilization
    },
    disk: {
      enabled: true,
      threshold: 0.8, // 80% utilization
      alertThreshold: 0.9 // 90% utilization
    }
  },
  
  // Business metrics
  business: {
    orders: {
      enabled: true,
      dailyTarget: 100,
      alertThreshold: 0.5 // 50% of target
    },
    revenue: {
      enabled: true,
      dailyTarget: 10000,
      alertThreshold: 0.5 // 50% of target
    },
    userRegistration: {
      enabled: true,
      dailyTarget: 50,
      alertThreshold: 0.3 // 30% of target
    }
  }
};

/**
 * Logging Configuration
 */
export const loggingConfig = {
  // Log levels
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
  },
  
  // Log formats
  formats: {
    development: {
      timestamp: true,
      colors: true,
      level: true,
      message: true,
      metadata: true
    },
    production: {
      timestamp: true,
      colors: false,
      level: true,
      message: true,
      metadata: true,
      json: true
    }
  },
  
  // Log destinations
  destinations: {
    console: {
      enabled: true,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    },
    file: {
      enabled: process.env.NODE_ENV === 'production',
      level: 'info',
      filename: 'logs/app.log',
      maxSize: '10m',
      maxFiles: 5
    },
    external: {
      enabled: process.env.LOG_EXTERNAL_ENABLED === 'true',
      level: 'error',
      endpoint: process.env.LOG_EXTERNAL_ENDPOINT
    }
  },
  
  // Log retention
  retention: {
    days: 30,
    maxSize: '100m',
    compress: true
  }
};

/**
 * Alerting Configuration
 */
export const alertingConfig = {
  // Alert channels
  channels: {
    email: {
      enabled: process.env.ALERT_EMAIL_ENABLED === 'true',
      recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
      smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      }
    },
    slack: {
      enabled: process.env.ALERT_SLACK_ENABLED === 'true',
      webhook: process.env.SLACK_WEBHOOK_URL,
      channel: process.env.SLACK_CHANNEL || '#alerts'
    },
    webhook: {
      enabled: process.env.ALERT_WEBHOOK_ENABLED === 'true',
      url: process.env.ALERT_WEBHOOK_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ALERT_WEBHOOK_TOKEN}`
      }
    }
  },
  
  // Alert rules
  rules: {
    critical: {
      responseTime: 10000, // 10 seconds
      errorRate: 0.2, // 20%
      memory: 0.95, // 95%
      cpu: 0.95, // 95%
      database: 0.9 // 90% connection pool
    },
    warning: {
      responseTime: 5000, // 5 seconds
      errorRate: 0.1, // 10%
      memory: 0.8, // 80%
      cpu: 0.8, // 80%
      database: 0.7 // 70% connection pool
    }
  },
  
  // Alert cooldown (prevent spam)
  cooldown: {
    critical: 300000, // 5 minutes
    warning: 600000 // 10 minutes
  }
};

/**
 * Health Check Configuration
 */
export const healthConfig = {
  // Health check endpoints
  endpoints: {
    database: {
      enabled: true,
      timeout: 5000,
      interval: 30000 // 30 seconds
    },
    redis: {
      enabled: process.env.REDIS_ENABLED === 'true',
      timeout: 3000,
      interval: 30000
    },
    external: {
      enabled: process.env.EXTERNAL_HEALTH_CHECK_ENABLED === 'true',
      url: process.env.EXTERNAL_HEALTH_CHECK_URL,
      timeout: 10000,
      interval: 60000 // 1 minute
    }
  },
  
  // Health check thresholds
  thresholds: {
    database: {
      maxResponseTime: 2000,
      maxErrorRate: 0.05
    },
    redis: {
      maxResponseTime: 1000,
      maxErrorRate: 0.05
    },
    external: {
      maxResponseTime: 5000,
      maxErrorRate: 0.1
    }
  }
};

/**
 * Metrics Collection Configuration
 */
export const collectionConfig = {
  // Collection intervals
  intervals: {
    system: 60000, // 1 minute
    application: 30000, // 30 seconds
    business: 300000, // 5 minutes
    custom: 60000 // 1 minute
  },
  
  // Data retention
  retention: {
    raw: 86400000, // 24 hours
    aggregated: 2592000000, // 30 days
    historical: 31536000000 // 1 year
  },
  
  // Aggregation rules
  aggregation: {
    system: {
      method: 'average',
      window: 300000 // 5 minutes
    },
    application: {
      method: 'sum',
      window: 60000 // 1 minute
    },
    business: {
      method: 'sum',
      window: 3600000 // 1 hour
    }
  }
};

/**
 * Monitoring Utilities
 */
export const monitoringUtils = {
  /**
   * Calculate response time percentile
   */
  calculatePercentile(values, percentile) {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  },
  
  /**
   * Calculate error rate
   */
  calculateErrorRate(total, errors) {
    return total > 0 ? errors / total : 0;
  },
  
  /**
   * Format metric value
   */
  formatMetric(value, type = 'number') {
    switch (type) {
      case 'percentage':
        return `${(value * 100).toFixed(2)}%`;
      case 'bytes':
        return this.formatBytes(value);
      case 'duration':
        return this.formatDuration(value);
      default:
        return value.toLocaleString();
    }
  },
  
  /**
   * Format bytes
   */
  formatBytes(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  },
  
  /**
   * Format duration
   */
  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  },
  
  /**
   * Check if metric exceeds threshold
   */
  exceedsThreshold(value, threshold, operator = '>') {
    switch (operator) {
      case '>':
        return value > threshold;
      case '>=':
        return value >= threshold;
      case '<':
        return value < threshold;
      case '<=':
        return value <= threshold;
      case '==':
        return value === threshold;
      default:
        return false;
    }
  }
};

/**
 * Alert Templates
 */
export const alertTemplates = {
  critical: {
    title: '🚨 Critical Alert - CommerFlow',
    color: '#ff0000',
    icon: '🚨'
  },
  warning: {
    title: '⚠️ Warning Alert - CommerFlow',
    color: '#ffa500',
    icon: '⚠️'
  },
  info: {
    title: 'ℹ️ Info Alert - CommerFlow',
    color: '#0000ff',
    icon: 'ℹ️'
  }
};

/**
 * Default monitoring configuration
 */
export const defaultConfig = {
  metrics: metricsConfig,
  logging: loggingConfig,
  alerting: alertingConfig,
  health: healthConfig,
  collection: collectionConfig
};

export default {
  metricsConfig,
  loggingConfig,
  alertingConfig,
  healthConfig,
  collectionConfig,
  monitoringUtils,
  alertTemplates,
  defaultConfig
}; 