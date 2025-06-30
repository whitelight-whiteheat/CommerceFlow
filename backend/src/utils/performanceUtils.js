const { PrismaClient } = require('@prisma/client');

// Simple in-memory cache (for development - use Redis in production)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Performance monitoring
const performanceMetrics = {
  queryCount: 0,
  cacheHits: 0,
  cacheMisses: 0,
  slowQueries: []
};

// Cache utilities
const cacheUtils = {
  // Get value from cache
  get: (key) => {
    const item = cache.get(key);
    if (item && Date.now() - item.timestamp < CACHE_TTL) {
      performanceMetrics.cacheHits++;
      return item.value;
    }
    if (item) {
      cache.delete(key); // Remove expired item
    }
    performanceMetrics.cacheMisses++;
    return null;
  },

  // Set value in cache
  set: (key, value) => {
    cache.set(key, {
      value,
      timestamp: Date.now()
    });
  },

  // Clear cache
  clear: () => {
    cache.clear();
  },

  // Clear expired items
  cleanup: () => {
    const now = Date.now();
    for (const [key, item] of cache.entries()) {
      if (now - item.timestamp > CACHE_TTL) {
        cache.delete(key);
      }
    }
  }
};

// Query optimization utilities
const queryUtils = {
  // Add pagination to queries
  addPagination: (query, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return {
      ...query,
      skip,
      take: limit
    };
  },

  // Add sorting to queries
  addSorting: (query, sortBy = 'createdAt', sortOrder = 'desc') => {
    return {
      ...query,
      orderBy: {
        [sortBy]: sortOrder
      }
    };
  },

  // Add filtering to queries
  addFiltering: (query, filters = {}) => {
    const where = { ...query.where };
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'search') {
          where.OR = [
            { name: { contains: value, mode: 'insensitive' } },
            { description: { contains: value, mode: 'insensitive' } }
          ];
        } else if (key === 'priceRange') {
          const [min, max] = value.split('-');
          if (min) where.price = { ...where.price, gte: parseFloat(min) };
          if (max) where.price = { ...where.price, lte: parseFloat(max) };
        } else {
          where[key] = value;
        }
      }
    });

    return {
      ...query,
      where
    };
  },

  // Optimize includes for specific use cases
  optimizeIncludes: (includes, type = 'list') => {
    switch (type) {
      case 'list':
        // For list views, only include essential fields
        return {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        };
      case 'detail':
        // For detail views, include all related data
        return includes;
      case 'minimal':
        // For minimal data (e.g., dropdowns)
        return {};
      default:
        return includes;
    }
  }
};

// Performance monitoring utilities
const monitoringUtils = {
  // Track query performance
  trackQuery: (queryName, startTime) => {
    const duration = Date.now() - startTime;
    performanceMetrics.queryCount++;
    
    if (duration > 1000) { // Log slow queries (>1s)
      performanceMetrics.slowQueries.push({
        query: queryName,
        duration,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 100 slow queries
      if (performanceMetrics.slowQueries.length > 100) {
        performanceMetrics.slowQueries.shift();
      }
    }
    
    return duration;
  },

  // Get performance metrics
  getMetrics: () => {
    return {
      ...performanceMetrics,
      cacheSize: cache.size,
      cacheHitRate: performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) || 0
    };
  },

  // Reset metrics
  resetMetrics: () => {
    performanceMetrics.queryCount = 0;
    performanceMetrics.cacheHits = 0;
    performanceMetrics.cacheMisses = 0;
    performanceMetrics.slowQueries = [];
  }
};

// Database connection pooling optimization
const dbUtils = {
  // Optimize Prisma client for production
  optimizePrisma: (prisma) => {
    // Enable query logging in development
    if (process.env.NODE_ENV === 'development') {
      prisma.$on('query', (e) => {
        console.log('Query: ' + e.query);
        console.log('Params: ' + e.params);
        console.log('Duration: ' + e.duration + 'ms');
      });
    }

    // Handle connection errors
    prisma.$on('error', (e) => {
      console.error('Prisma error:', e);
    });

    return prisma;
  },

  // Batch operations for better performance
  batchOperations: {
    // Batch create products
    createProducts: async (prisma, products) => {
      return await prisma.product.createMany({
        data: products,
        skipDuplicates: true
      });
    },

    // Batch update products
    updateProducts: async (prisma, updates) => {
      const operations = updates.map(update => 
        prisma.product.update({
          where: { id: update.id },
          data: update.data
        })
      );
      return await prisma.$transaction(operations);
    }
  }
};

// Response optimization utilities
const responseUtils = {
  // Compress response data
  compressResponse: (data) => {
    // Remove unnecessary fields for list responses
    if (Array.isArray(data)) {
      return data.map(item => {
        const { createdAt, updatedAt, ...compressed } = item;
        return compressed;
      });
    }
    return data;
  },

  // Add performance headers
  addPerformanceHeaders: (res, startTime) => {
    const duration = Date.now() - startTime;
    res.set({
      'X-Response-Time': `${duration}ms`,
      'X-Cache-Hit': performanceMetrics.cacheHits > 0 ? 'true' : 'false'
    });
  }
};

// Cleanup expired cache items every 5 minutes
setInterval(() => {
  cacheUtils.cleanup();
}, 5 * 60 * 1000);

module.exports = {
  cacheUtils,
  queryUtils,
  monitoringUtils,
  dbUtils,
  responseUtils
}; 