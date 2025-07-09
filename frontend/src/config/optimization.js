/**
 * Frontend Optimization Configuration
 * 
 * Centralized configuration for frontend performance optimization.
 */

/**
 * Bundle Analysis Configuration
 */
export const bundleConfig = {
  // Bundle size thresholds (in KB)
  thresholds: {
    total: 500, // 500KB total bundle
    vendor: 300, // 300KB vendor bundle
    main: 200,   // 200KB main bundle
    chunk: 100   // 100KB per chunk
  },
  
  // Code splitting configuration
  codeSplitting: {
    // Routes to lazy load
    lazyRoutes: [
      '/admin',
      '/dashboard',
      '/products',
      '/orders',
      '/analytics',
      '/users'
    ],
    
    // Components to lazy load
    lazyComponents: [
      'ProductCatalog',
      'ShoppingCart',
      'CustomerDashboard',
      'Analytics',
      'Orders',
      'Users'
    ]
  },
  
  // Tree shaking configuration
  treeShaking: {
    enabled: true,
    sideEffects: false,
    usedExports: true
  }
};

/**
 * Performance Configuration
 */
export const performanceConfig = {
  // Image optimization
  images: {
    formats: ['webp', 'avif'],
    sizes: [320, 640, 768, 1024, 1280],
    quality: 80,
    lazyLoading: true
  },
  
  // Caching configuration
  caching: {
    staticAssets: {
      maxAge: 31536000, // 1 year
      immutable: true
    },
    apiResponses: {
      maxAge: 300, // 5 minutes
      staleWhileRevalidate: 60 // 1 minute
    }
  },
  
  // Compression configuration
  compression: {
    enabled: true,
    level: 6,
    threshold: 1024 // Only compress files > 1KB
  }
};

/**
 * Component Optimization Configuration
 */
export const componentConfig = {
  // Memoization thresholds
  memoization: {
    productList: 50,    // Memoize if > 50 products
    orderList: 20,      // Memoize if > 20 orders
    userList: 30        // Memoize if > 30 users
  },
  
  // Virtualization thresholds
  virtualization: {
    productGrid: 100,   // Virtualize if > 100 products
    orderTable: 50,     // Virtualize if > 50 orders
    userTable: 30       // Virtualize if > 30 users
  },
  
  // Debounce delays (in ms)
  debounce: {
    search: 300,
    filter: 200,
    resize: 150,
    scroll: 100
  }
};

/**
 * Bundle Analysis Utilities
 */
export const bundleUtils = {
  /**
   * Calculate bundle size in KB
   */
  getBundleSize(bundle) {
    return Math.round(bundle.size / 1024);
  },
  
  /**
   * Check if bundle size is within thresholds
   */
  isBundleSizeAcceptable(bundle, type = 'total') {
    const size = this.getBundleSize(bundle);
    const threshold = bundleConfig.thresholds[type];
    return size <= threshold;
  },
  
  /**
   * Get bundle optimization recommendations
   */
  getOptimizationRecommendations(bundle) {
    const recommendations = [];
    const size = this.getBundleSize(bundle);
    
    if (size > bundleConfig.thresholds.total) {
      recommendations.push('Consider code splitting for large components');
      recommendations.push('Implement lazy loading for routes');
      recommendations.push('Optimize third-party dependencies');
    }
    
    if (size > bundleConfig.thresholds.vendor) {
      recommendations.push('Review and remove unused dependencies');
      recommendations.push('Consider using smaller alternatives');
      recommendations.push('Implement tree shaking');
    }
    
    return recommendations;
  }
};

/**
 * Performance Monitoring Configuration
 */
export const monitoringConfig = {
  // Core Web Vitals thresholds
  coreWebVitals: {
    lcp: 2500,    // Largest Contentful Paint (2.5s)
    fid: 100,     // First Input Delay (100ms)
    cls: 0.1,     // Cumulative Layout Shift (0.1)
    ttfb: 800,    // Time to First Byte (800ms)
    fcp: 1800     // First Contentful Paint (1.8s)
  },
  
  // Performance budgets
  budgets: {
    js: 300,      // 300KB JavaScript
    css: 50,      // 50KB CSS
    images: 200,  // 200KB Images
    fonts: 100    // 100KB Fonts
  },
  
  // Monitoring intervals
  intervals: {
    metrics: 5000,    // Collect metrics every 5s
    errors: 1000,     // Report errors immediately
    performance: 10000 // Performance check every 10s
  }
};

/**
 * Optimization Recommendations
 */
export const getOptimizationRecommendations = () => {
  return [
    'Implement React.memo for expensive components',
    'Use React.lazy for code splitting',
    'Optimize images with WebP format',
    'Implement virtual scrolling for large lists',
    'Use debouncing for search and filter inputs',
    'Implement service worker for caching',
    'Optimize bundle splitting',
    'Use tree shaking to remove unused code',
    'Implement progressive loading',
    'Optimize third-party script loading'
  ];
};

export default {
  bundleConfig,
  performanceConfig,
  componentConfig,
  bundleUtils,
  monitoringConfig,
  getOptimizationRecommendations
}; 