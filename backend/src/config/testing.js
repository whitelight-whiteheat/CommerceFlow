/**
 * Testing Configuration
 * 
 * Centralized configuration for unit tests, integration tests, and test utilities.
 */

/**
 * Test Environment Configuration
 */
export const testConfig = {
  // Test environment settings
  environment: {
    nodeEnv: 'test',
    database: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/commerflow_test',
      name: 'commerflow_test',
      resetOnStart: true
    },
    redis: {
      url: process.env.TEST_REDIS_URL || 'redis://localhost:6379/1',
      db: 1
    },
    server: {
      port: process.env.TEST_PORT || 3001,
      host: 'localhost'
    }
  },
  
  // Test timeouts
  timeouts: {
    unit: 5000,      // 5 seconds
    integration: 10000, // 10 seconds
    e2e: 30000,      // 30 seconds
    setup: 15000     // 15 seconds
  },
  
  // Test coverage thresholds
  coverage: {
    statements: 80,
    branches: 70,
    functions: 80,
    lines: 80
  },
  
  // Test reporting
  reporting: {
    verbose: true,
    colors: true,
    coverage: true,
    junit: true,
    html: true
  }
};

/**
 * Test Data Configuration
 */
export const testDataConfig = {
  // Sample users for testing
  users: {
    admin: {
      email: 'admin@test.com',
      password: 'Admin123!',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User'
    },
    manager: {
      email: 'manager@test.com',
      password: 'Manager123!',
      role: 'manager',
      firstName: 'Manager',
      lastName: 'User'
    },
    customer: {
      email: 'customer@test.com',
      password: 'Customer123!',
      role: 'customer',
      firstName: 'Customer',
      lastName: 'User'
    },
    guest: {
      email: 'guest@test.com',
      password: 'Guest123!',
      role: 'guest',
      firstName: 'Guest',
      lastName: 'User'
    }
  },
  
  // Sample products for testing
  products: [
    {
      name: 'Test Product 1',
      description: 'A test product for testing',
      price: 29.99,
      category: 'Electronics',
      stock: 100,
      imageUrl: 'https://via.placeholder.com/300x200'
    },
    {
      name: 'Test Product 2',
      description: 'Another test product',
      price: 49.99,
      category: 'Clothing',
      stock: 50,
      imageUrl: 'https://via.placeholder.com/300x200'
    },
    {
      name: 'Test Product 3',
      description: 'Yet another test product',
      price: 19.99,
      category: 'Books',
      stock: 200,
      imageUrl: 'https://via.placeholder.com/300x200'
    }
  ],
  
  // Sample orders for testing
  orders: [
    {
      userId: 1,
      items: [
        { productId: 1, quantity: 2, price: 29.99 },
        { productId: 2, quantity: 1, price: 49.99 }
      ],
      status: 'pending',
      total: 109.97
    },
    {
      userId: 2,
      items: [
        { productId: 3, quantity: 3, price: 19.99 }
      ],
      status: 'completed',
      total: 59.97
    }
  ],
  
  // Sample categories for testing
  categories: [
    { name: 'Electronics', description: 'Electronic devices and accessories' },
    { name: 'Clothing', description: 'Apparel and fashion items' },
    { name: 'Books', description: 'Books and publications' },
    { name: 'Home & Garden', description: 'Home improvement and garden items' }
  ]
};

/**
 * Test Utilities Configuration
 */
export const testUtilsConfig = {
  // Database utilities
  database: {
    truncateTables: [
      'OrderItem',
      'Order',
      'Product',
      'Category',
      'User'
    ],
    seedData: true,
    backupBeforeTest: false
  },
  
  // Authentication utilities
  auth: {
    generateTestToken: true,
    tokenExpiry: '1h',
    includeUserData: true
  },
  
  // HTTP utilities
  http: {
    baseUrl: 'http://localhost:3001',
    timeout: 10000,
    retries: 3,
    followRedirects: true
  },
  
  // Mock utilities
  mocks: {
    externalAPIs: true,
    fileSystem: true,
    database: false,
    email: true
  }
};

/**
 * Test Categories Configuration
 */
export const testCategories = {
  // Unit tests
  unit: {
    description: 'Unit tests for individual functions and modules',
    pattern: '**/*.unit.test.js',
    timeout: 5000,
    parallel: true
  },
  
  // Integration tests
  integration: {
    description: 'Integration tests for API endpoints and database operations',
    pattern: '**/*.integration.test.js',
    timeout: 10000,
    parallel: false
  },
  
  // End-to-end tests
  e2e: {
    description: 'End-to-end tests for complete user workflows',
    pattern: '**/*.e2e.test.js',
    timeout: 30000,
    parallel: false
  },
  
  // Performance tests
  performance: {
    description: 'Performance and load tests',
    pattern: '**/*.performance.test.js',
    timeout: 60000,
    parallel: true
  },
  
  // Security tests
  security: {
    description: 'Security and vulnerability tests',
    pattern: '**/*.security.test.js',
    timeout: 15000,
    parallel: false
  }
};

/**
 * Test Hooks Configuration
 */
export const testHooks = {
  // Global setup
  globalSetup: {
    beforeAll: [
      'setupTestDatabase',
      'seedTestData',
      'startTestServer'
    ],
    afterAll: [
      'stopTestServer',
      'cleanupTestDatabase'
    ]
  },
  
  // Test suite setup
  suiteSetup: {
    beforeEach: [
      'clearTestData',
      'resetTestState'
    ],
    afterEach: [
      'cleanupTestData',
      'resetMocks'
    ]
  },
  
  // Individual test setup
  testSetup: {
    beforeEach: [
      'setupTestContext',
      'setupTestUser'
    ],
    afterEach: [
      'cleanupTestContext',
      'resetTestUser'
    ]
  }
};

/**
 * Test Assertions Configuration
 */
export const assertionConfig = {
  // Custom assertion messages
  messages: {
    userNotFound: 'User should exist in database',
    productNotFound: 'Product should exist in database',
    orderNotFound: 'Order should exist in database',
    invalidResponse: 'Response should be valid',
    unauthorized: 'Request should be unauthorized',
    forbidden: 'Request should be forbidden',
    validationError: 'Request should have validation errors'
  },
  
  // Response validation
  response: {
    statusCode: true,
    contentType: true,
    bodyStructure: true,
    errorFormat: true
  },
  
  // Database validation
  database: {
    recordExists: true,
    recordCount: true,
    dataIntegrity: true,
    foreignKeys: true
  }
};

/**
 * Test Performance Configuration
 */
export const performanceConfig = {
  // Performance thresholds
  thresholds: {
    responseTime: {
      fast: 100,    // 100ms
      normal: 500,  // 500ms
      slow: 2000    // 2s
    },
    memoryUsage: {
      low: 50,      // 50MB
      normal: 100,  // 100MB
      high: 500     // 500MB
    },
    cpuUsage: {
      low: 10,      // 10%
      normal: 30,   // 30%
      high: 70      // 70%
    }
  },
  
  // Load test configuration
  loadTest: {
    users: 10,
    duration: 60,   // seconds
    rampUp: 10,     // seconds
    targetRPS: 100  // requests per second
  },
  
  // Stress test configuration
  stressTest: {
    maxUsers: 100,
    maxDuration: 300, // 5 minutes
    stepDuration: 30, // 30 seconds
    stepUsers: 10
  }
};

/**
 * Test Reporting Configuration
 */
export const reportingConfig = {
  // Report formats
  formats: {
    console: {
      enabled: true,
      colors: true,
      verbose: true
    },
    json: {
      enabled: true,
      output: 'test-results.json',
      includeDetails: true
    },
    html: {
      enabled: true,
      output: 'test-report.html',
      template: 'default'
    },
    junit: {
      enabled: true,
      output: 'test-results.xml',
      suiteName: 'CommerFlow Tests'
    }
  },
  
  // Coverage reporting
  coverage: {
    enabled: true,
    reporters: ['text', 'html', 'lcov'],
    exclude: [
      'node_modules/**',
      'coverage/**',
      'test/**',
      '**/*.test.js',
      '**/*.spec.js'
    ],
    thresholds: {
      global: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80
      }
    }
  },
  
  // Test metrics
  metrics: {
    executionTime: true,
    memoryUsage: true,
    testCount: true,
    passRate: true,
    coverage: true
  }
};

/**
 * Test Utilities
 */
export const testUtils = {
  /**
   * Generate test user data
   */
  generateTestUser(role = 'customer', overrides = {}) {
    const baseUser = testDataConfig.users[role] || testDataConfig.users.customer;
    return {
      ...baseUser,
      ...overrides,
      email: overrides.email || `${role}_${Date.now()}@test.com`
    };
  },
  
  /**
   * Generate test product data
   */
  generateTestProduct(overrides = {}) {
    return {
      name: `Test Product ${Date.now()}`,
      description: 'A test product for testing',
      price: 29.99,
      category: 'Electronics',
      stock: 100,
      imageUrl: 'https://via.placeholder.com/300x200',
      ...overrides
    };
  },
  
  /**
   * Generate test order data
   */
  generateTestOrder(userId, items = [], overrides = {}) {
    return {
      userId,
      items: items.length > 0 ? items : [
        { productId: 1, quantity: 1, price: 29.99 }
      ],
      status: 'pending',
      total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      ...overrides
    };
  },
  
  /**
   * Generate JWT token for testing
   */
  generateTestToken(user = null) {
    const jwt = require('jsonwebtoken');
    const testUser = user || testDataConfig.users.customer;
    
    return jwt.sign(
      {
        userId: testUser.id || 1,
        email: testUser.email,
        role: testUser.role
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  },
  
  /**
   * Create test request
   */
  createTestRequest(method = 'GET', url = '/', data = null, token = null) {
    const request = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    
    if (data) {
      request.body = data;
    }
    
    return request;
  },
  
  /**
   * Validate test response
   */
  validateTestResponse(response, expectedStatus = 200, expectedStructure = null) {
    expect(response.status).toBe(expectedStatus);
    
    if (expectedStructure) {
      expect(response.body).toMatchObject(expectedStructure);
    }
    
    return response;
  },
  
  /**
   * Wait for async operation
   */
  async wait(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  /**
   * Retry async operation
   */
  async retry(operation, maxAttempts = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt < maxAttempts) {
          await this.wait(delay);
        }
      }
    }
    
    throw lastError;
  }
};

/**
 * Test Environment Setup
 */
export const testEnvironment = {
  /**
   * Setup test database
   */
  async setupDatabase() {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      // Reset database
      await prisma.$executeRaw`DROP SCHEMA IF EXISTS public CASCADE`;
      await prisma.$executeRaw`CREATE SCHEMA public`;
      
      // Run migrations
      const { execSync } = require('child_process');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      
      // Seed test data
      await this.seedTestData(prisma);
      
    } finally {
      await prisma.$disconnect();
    }
  },
  
  /**
   * Seed test data
   */
  async seedTestData(prisma) {
    // Create test users
    for (const [role, userData] of Object.entries(testDataConfig.users)) {
      await prisma.user.create({
        data: {
          ...userData,
          password: await require('bcrypt').hash(userData.password, 12)
        }
      });
    }
    
    // Create test categories
    for (const category of testDataConfig.categories) {
      await prisma.category.create({ data: category });
    }
    
    // Create test products
    for (const product of testDataConfig.products) {
      await prisma.product.create({ data: product });
    }
  },
  
  /**
   * Cleanup test database
   */
  async cleanupDatabase() {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      // Truncate all tables
      for (const table of testUtilsConfig.database.truncateTables) {
        await prisma.$executeRaw`TRUNCATE TABLE "${table}" CASCADE`;
      }
    } finally {
      await prisma.$disconnect();
    }
  }
};

/**
 * Default test configuration
 */
export const defaultTestConfig = {
  test: testConfig,
  data: testDataConfig,
  utils: testUtilsConfig,
  categories: testCategories,
  hooks: testHooks,
  assertions: assertionConfig,
  performance: performanceConfig,
  reporting: reportingConfig
};

export default {
  testConfig,
  testDataConfig,
  testUtilsConfig,
  testCategories,
  testHooks,
  assertionConfig,
  performanceConfig,
  reportingConfig,
  testUtils,
  testEnvironment,
  defaultTestConfig
}; 