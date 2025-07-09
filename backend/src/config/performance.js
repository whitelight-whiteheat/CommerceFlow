/**
 * Performance Configuration
 * 
 * Centralized performance tuning and optimization settings.
 */

const { ENV_CONFIG } = require('./constants');

/**
 * Performance Configuration Class
 */
class PerformanceConfig {
  constructor() {
    this.cache = this.getCacheConfig();
    this.database = this.getDatabaseConfig();
    this.response = this.getResponseConfig();
    this.monitoring = this.getMonitoringConfig();
  }

  /**
   * Cache configuration
   */
  getCacheConfig() {
    return {
      // In-memory cache settings
      ttl: ENV_CONFIG.CACHE_TTL || 300000, // 5 minutes default
      maxSize: 1000, // Maximum number of cached items
      checkPeriod: 60000, // Check for expired items every minute
      
      // Cache keys
      keys: {
        products: 'products',
        categories: 'categories',
        userProfile: 'user:profile:',
        userCart: 'user:cart:',
        productById: 'product:',
        categoryById: 'category:'
      },
      
      // Cache strategies
      strategies: {
        products: {
          ttl: 300000, // 5 minutes
          maxAge: 600000 // 10 minutes max age
        },
        userData: {
          ttl: 180000, // 3 minutes
          maxAge: 300000 // 5 minutes max age
        },
        staticData: {
          ttl: 3600000, // 1 hour
          maxAge: 7200000 // 2 hours max age
        }
      }
    };
  }

  /**
   * Database optimization settings
   */
  getDatabaseConfig() {
    return {
      // Connection pool settings
      pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200
      },
      
      // Query optimization
      query: {
        timeout: 30000, // 30 seconds
        maxRows: 1000, // Maximum rows per query
        enableLogging: ENV_CONFIG.NODE_ENV === 'development'
      },
      
      // Index hints
      indexes: {
        products: ['categoryId', 'price', 'createdAt'],
        orders: ['userId', 'status', 'createdAt'],
        users: ['email', 'role', 'createdAt']
      }
    };
  }

  /**
   * Response optimization settings
   */
  getResponseConfig() {
    return {
      // Compression settings
      compression: {
        enabled: true,
        level: 6,
        threshold: 1024 // Only compress responses > 1KB
      },
      
      // Response caching
      caching: {
        enabled: true,
        maxAge: 300, // 5 minutes
        etag: true,
        lastModified: true
      },
      
      // Pagination defaults
      pagination: {
        defaultLimit: 10,
        maxLimit: 100,
        defaultPage: 1
      },
      
      // Response size limits
      limits: {
        maxResponseSize: 1048576, // 1MB
        maxArrayLength: 1000,
        maxObjectDepth: 10
      }
    };
  }

  /**
   * Monitoring and metrics settings
   */
  getMonitoringConfig() {
    return {
      // Performance monitoring
      monitoring: {
        enabled: ENV_CONFIG.ENABLE_METRICS,
        port: ENV_CONFIG.METRICS_PORT || 9090,
        interval: 5000 // Collect metrics every 5 seconds
      },
      
      // Metrics to track
      metrics: {
        responseTime: true,
        requestCount: true,
        errorRate: true,
        cacheHitRate: true,
        databaseQueryTime: true,
        memoryUsage: true,
        cpuUsage: true
      },
      
      // Alerting thresholds
      thresholds: {
        responseTime: 1000, // 1 second
        errorRate: 0.05, // 5%
        memoryUsage: 0.8, // 80%
        cpuUsage: 0.7 // 70%
      }
    };
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations() {
    const recommendations = [];
    
    if (ENV_CONFIG.NODE_ENV === 'production') {
      recommendations.push(
        'Enable Redis caching for better performance',
        'Use database connection pooling',
        'Implement response compression',
        'Add database indexes for frequently queried fields',
        'Use pagination for large datasets',
        'Implement request rate limiting',
        'Monitor performance metrics'
      );
    }
    
    return recommendations;
  }

  /**
   * Validate performance configuration
   */
  validate() {
    const issues = [];
    
    if (this.cache.ttl < 60000) {
      issues.push('Cache TTL should be at least 1 minute');
    }
    
    if (this.database.pool.max > 20) {
      issues.push('Database pool max connections should not exceed 20');
    }
    
    if (this.response.pagination.maxLimit > 1000) {
      issues.push('Pagination max limit should not exceed 1000');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}

// Create singleton instance
const performanceConfig = new PerformanceConfig();

module.exports = {
  PerformanceConfig,
  performanceConfig
}; 