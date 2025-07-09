#!/usr/bin/env node

/**
 * CommerFlow Portfolio Demo Test Runner
 * 
 * This single file replaces all the scattered test files and provides
 * a comprehensive demo of the application's functionality.
 * 
 * Usage: node demo-test.js
 */

const axios = require('axios');
const colors = require('colors/safe');

const { urlConfig } = require('./src/config/urls');

const BASE_URL = process.env.BACKEND_URL || urlConfig.baseUrl;
const FRONTEND_URL = process.env.FRONTEND_URL || urlConfig.frontendUrl;

// Demo credentials
const DEMO_CREDENTIALS = {
  admin: { email: 'admin@example.com', password: 'admin123' },
  user: { email: 'demo@example.com', password: 'demo123' }
};

class DemoTestRunner {
  constructor() {
    this.adminToken = null;
    this.userToken = null;
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}]`;
    
    switch (type) {
      case 'success':
        console.log(`${prefix} ${colors.green('✅')} ${message}`);
        break;
      case 'error':
        console.log(`${prefix} ${colors.red('❌')} ${message}`);
        break;
      case 'warning':
        console.log(`${prefix} ${colors.yellow('⚠️')} ${message}`);
        break;
      case 'info':
        console.log(`${prefix} ${colors.blue('ℹ️')} ${message}`);
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
  }

  async testEndpoint(name, method, endpoint, data = null, headers = {}) {
    try {
      const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };
      
      if (data) {
        config.data = data;
      }
      
      const response = await axios(config);
      this.log(`${name}: ${method} ${endpoint} - Status: ${response.status}`, 'success');
      return { success: true, data: response.data };
    } catch (error) {
      const status = error.response?.status || 'Connection Error';
      const message = error.response?.data?.message || error.message;
      this.log(`${name}: ${method} ${endpoint} - Error: ${status} - ${message}`, 'error');
      return { success: false, error: message };
    }
  }

  async runHealthChecks() {
    this.log('🏥 Running Health Checks...', 'info');
    
    await this.testEndpoint('API Documentation', 'GET', '/api-docs');
    await this.testEndpoint('Health Check', 'GET', '/health');
    await this.testEndpoint('Products (Public)', 'GET', '/api/products');
    await this.testEndpoint('Categories (Public)', 'GET', '/api/categories');
  }

  async runAuthenticationTests() {
    this.log('🔐 Testing Authentication...', 'info');
    
    // Test admin login
    const adminLogin = await this.testEndpoint(
      'Admin Login',
      'POST',
      '/api/users/login',
      DEMO_CREDENTIALS.admin
    );
    
    if (adminLogin.success) {
      this.adminToken = adminLogin.data.token;
      this.log(`Admin token received: ${this.adminToken.substring(0, 20)}...`, 'success');
    }
    
    // Test user registration
    const userReg = await this.testEndpoint(
      'User Registration',
      'POST',
      '/api/users/register',
      {
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'demo123'
      }
    );
    
    if (userReg.success) {
      this.userToken = userReg.data.token;
      this.log(`User token received: ${this.userToken.substring(0, 20)}...`, 'success');
    }
  }

  async runAdminTests() {
    if (!this.adminToken) {
      this.log('Skipping admin tests - no admin token available', 'warning');
      return;
    }
    
    this.log('👨‍💼 Testing Admin Features...', 'info');
    
    await this.testEndpoint(
      'Admin Dashboard',
      'GET',
      '/api/admin/dashboard',
      null,
      { Authorization: `Bearer ${this.adminToken}` }
    );
    
    await this.testEndpoint(
      'List Users',
      'GET',
      '/api/admin/users',
      null,
      { Authorization: `Bearer ${this.adminToken}` }
    );
    
    // Test product creation
    const newProduct = {
      name: 'Portfolio Demo Product',
      description: 'Created during portfolio demo testing',
      price: 49.99,
      stock: 50,
      categoryId: 1, // Assuming category exists
      images: ['demo-product.jpg']
    };
    
    await this.testEndpoint(
      'Create Product',
      'POST',
      '/api/products',
      newProduct,
      { Authorization: `Bearer ${this.adminToken}` }
    );
  }

  async runCustomerTests() {
    if (!this.userToken) {
      this.log('Skipping customer tests - no user token available', 'warning');
      return;
    }
    
    this.log('🛒 Testing Customer Features...', 'info');
    
    // Add item to cart
    await this.testEndpoint(
      'Add to Cart',
      'POST',
      '/api/cart/items',
      { productId: 1, quantity: 2 },
      { Authorization: `Bearer ${this.userToken}` }
    );
    
    // View cart
    await this.testEndpoint(
      'View Cart',
      'GET',
      '/api/cart',
      null,
      { Authorization: `Bearer ${this.userToken}` }
    );
    
    // Create order
    await this.testEndpoint(
      'Create Order',
      'POST',
      '/api/orders',
      null,
      { Authorization: `Bearer ${this.userToken}` }
    );
  }

  async runPortfolioDemoChecks() {
    this.log('🎯 Portfolio Demo Configuration Check...', 'info');
    
    // Check environment variables
    const jwtSecret = process.env.JWT_SECRET || 'portfolio-demo-secret';
    const corsOrigin = process.env.CORS_ORIGIN || '*';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    this.log(`JWT Secret: ${jwtSecret.substring(0, 10)}...`, 'info');
    this.log(`CORS Origin: ${corsOrigin}`, 'info');
    this.log(`Admin Email: ${adminEmail}`, 'info');
    this.log(`Admin Password: ${adminPassword}`, 'info');
    
    if (corsOrigin === '*') {
      this.log('✅ CORS is relaxed for demo purposes', 'success');
    }
    
    if (adminPassword === 'admin123') {
      this.log('✅ Using demo admin credentials', 'success');
    }
  }

  async run() {
    console.log(colors.cyan.bold('\n🚀 CommerFlow Portfolio Demo Test Runner\n'));
    console.log(colors.gray('This test runner demonstrates all major features of the application.\n'));
    
    try {
      await this.runHealthChecks();
      await this.runAuthenticationTests();
      await this.runAdminTests();
      await this.runCustomerTests();
      await this.runPortfolioDemoChecks();
      
      console.log(colors.green.bold('\n🎉 Demo Test Runner Complete!\n'));
      console.log(colors.cyan('📊 Application Status:'));
      console.log(`   Backend: ${BASE_URL}`);
      console.log(`   Frontend: ${FRONTEND_URL}`);
      console.log(colors.cyan('\n🔐 Demo Credentials:'));
      console.log(`   Admin: ${DEMO_CREDENTIALS.admin.email} / ${DEMO_CREDENTIALS.admin.password}`);
      console.log(`   User: ${DEMO_CREDENTIALS.user.email} / ${DEMO_CREDENTIALS.user.password}`);
      console.log(colors.cyan('\n💡 Next Steps:'));
      console.log('   1. Visit the frontend to see the UI');
      console.log('   2. Try logging in with the demo credentials');
      console.log('   3. Explore the admin dashboard');
      console.log('   4. Test the shopping cart functionality');
      console.log(colors.yellow('\n⚠️  Note: This is a portfolio demo with relaxed security for easy access.\n'));
      
    } catch (error) {
      this.log(`Test runner failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run the demo test
if (require.main === module) {
  const runner = new DemoTestRunner();
  runner.run();
}

module.exports = DemoTestRunner; 