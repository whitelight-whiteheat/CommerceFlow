const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let testUserId = '';

// Test data
const testData = {
  admin: {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123'
  },
  user: {
    name: 'Test User',
    email: 'user@test.com',
    password: 'password123'
  },
  category: {
    name: 'Electronics',
    description: 'Electronic devices and gadgets'
  },
  product: {
    name: 'Test Product',
    description: 'A test product for admin dashboard',
    price: 99.99,
    stock: 50,
    imageUrl: 'https://example.com/image.jpg'
  }
};

// Helper function to make authenticated requests
const makeAuthRequest = async (method, url, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

// Helper to set admin role in DB after registration
const setAdminRole = async (email) => {
  // This function updates the user with the given email to have role 'ADMIN'.
  const updated = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' }
  });
  return updated;
};

// Test functions
const testAdminRegistration = async () => {
  console.log('\n🔐 Testing Admin Registration...');
  try {
    const response = await axios.post(`${BASE_URL}/users/register`, testData.admin);
    console.log('✅ Admin registered successfully');
    adminToken = response.data.token;
    // Set role to ADMIN in DB after registration
    await setAdminRole(testData.admin.email);
    return true;
  } catch (error) {
    if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
      console.log('ℹ️ Admin already exists, attempting login...');
      // Still ensure role is ADMIN
      await setAdminRole(testData.admin.email);
      return await testAdminLogin();
    }
    console.error('❌ Admin registration failed:', error.response?.data || error.message);
    return false;
  }
};

const testAdminLogin = async () => {
  console.log('\n🔑 Testing Admin Login...');
  try {
    const response = await axios.post(`${BASE_URL}/users/login`, {
      email: testData.admin.email,
      password: testData.admin.password
    });
    console.log('✅ Admin login successful');
    adminToken = response.data.token;
    return true;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
    return false;
  }
};

const testUserRegistration = async () => {
  console.log('\n👤 Testing User Registration...');
  try {
    const response = await axios.post(`${BASE_URL}/users/register`, testData.user);
    console.log('✅ User registered successfully');
    testUserId = response.data.user.id;
    return true;
  } catch (error) {
    if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
      console.log('ℹ️ User already exists');
      return true;
    }
    console.error('❌ User registration failed:', error.response?.data || error.message);
    return false;
  }
};

const testCategoryCreation = async () => {
  console.log('\n📂 Testing Category Creation...');
  try {
    const response = await makeAuthRequest('POST', '/categories', testData.category);
    console.log('✅ Category created successfully');
    return response.data.id;
  } catch (error) {
    console.error('❌ Category creation failed:', error.response?.data || error.message);
    return null;
  }
};

const testProductCreation = async (categoryId) => {
  console.log('\n📦 Testing Product Creation...');
  try {
    const productData = { ...testData.product, categoryId };
    const response = await makeAuthRequest('POST', '/products', productData);
    console.log('✅ Product created successfully');
    return response.data.id;
  } catch (error) {
    console.error('❌ Product creation failed:', error.response?.data || error.message);
    return null;
  }
};

const testOrderCreation = async () => {
  console.log('\n🛒 Testing Order Creation...');
  try {
    // First, add item to cart
    const cartResponse = await axios.post(`${BASE_URL}/cart/add`, {
      productId: '1', // Assuming product ID 1 exists
      quantity: 2
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Then create order from cart
    const orderResponse = await axios.post(`${BASE_URL}/orders`, {
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'Test Country'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Order created successfully');
    return true;
  } catch (error) {
    console.error('❌ Order creation failed:', error.response?.data || error.message);
    return false;
  }
};

const testDashboardStats = async () => {
  console.log('\n📊 Testing Dashboard Stats...');
  try {
    const response = await makeAuthRequest('GET', '/admin/dashboard');
    const data = response.data;
    
    console.log('✅ Dashboard stats retrieved successfully');
    console.log('📈 Overview:', {
      totalUsers: data.overview.totalUsers,
      totalProducts: data.overview.totalProducts,
      totalOrders: data.overview.totalOrders,
      totalRevenue: data.overview.totalRevenue
    });
    console.log('📋 Orders by status:', data.ordersByStatus);
    console.log('🆕 Recent orders:', data.recentOrders.length);
    console.log('⚠️ Low stock products:', data.lowStockProducts.length);
    console.log('🔥 Top selling products:', data.topSellingProducts.length);
    
    return true;
  } catch (error) {
    console.error('❌ Dashboard stats failed:', error.response?.data || error.message);
    return false;
  }
};

const testAllOrders = async () => {
  console.log('\n📋 Testing All Orders...');
  try {
    const response = await makeAuthRequest('GET', '/admin/orders?page=1&limit=10');
    const data = response.data;
    
    console.log('✅ All orders retrieved successfully');
    console.log('📄 Orders:', data.orders.length);
    console.log('📊 Pagination:', data.pagination);
    
    return true;
  } catch (error) {
    console.error('❌ All orders failed:', error.response?.data || error.message);
    return false;
  }
};

const testAllUsers = async () => {
  console.log('\n👥 Testing All Users...');
  try {
    const response = await makeAuthRequest('GET', '/admin/users?page=1&limit=10');
    const data = response.data;
    
    console.log('✅ All users retrieved successfully');
    console.log('👤 Users:', data.users.length);
    console.log('📊 Pagination:', data.pagination);
    
    return true;
  } catch (error) {
    console.error('❌ All users failed:', error.response?.data || error.message);
    return false;
  }
};

const testInventoryOverview = async () => {
  console.log('\n📦 Testing Inventory Overview...');
  try {
    const response = await makeAuthRequest('GET', '/admin/inventory');
    const data = response.data;
    
    console.log('✅ Inventory overview retrieved successfully');
    console.log('⚠️ Low stock products:', data.lowStockProducts.length);
    console.log('🚫 Out of stock products:', data.outOfStockProducts.length);
    console.log('📊 Stock stats:', data.stockStats);
    console.log('📂 Products by category:', data.productsByCategory.length);
    
    return true;
  } catch (error) {
    console.error('❌ Inventory overview failed:', error.response?.data || error.message);
    return false;
  }
};

const testSalesAnalytics = async () => {
  console.log('\n📈 Testing Sales Analytics...');
  try {
    const response = await makeAuthRequest('GET', '/admin/analytics/sales?period=30');
    const data = response.data;
    
    console.log('✅ Sales analytics retrieved successfully');
    console.log('📅 Period:', data.period);
    console.log('💰 Total sales:', data.totalSales);
    console.log('📋 Total orders:', data.totalOrders);
    console.log('📦 Total items:', data.totalItems);
    console.log('📊 Daily sales entries:', data.dailySales.length);
    console.log('🏆 Top categories:', data.topCategories.length);
    
    return true;
  } catch (error) {
    console.error('❌ Sales analytics failed:', error.response?.data || error.message);
    return false;
  }
};

const testNonAdminAccess = async () => {
  console.log('\n🚫 Testing Non-Admin Access (should fail)...');
  try {
    // Try to access admin endpoint without admin role
    const userResponse = await axios.post(`${BASE_URL}/users/login`, {
      email: testData.user.email,
      password: testData.user.password
    });
    
    const userToken = userResponse.data.token;
    
    await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.error('❌ Non-admin access should have failed but succeeded');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ Non-admin access correctly blocked');
      return true;
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Admin Dashboard API Tests...\n');
  
  const tests = [
    { name: 'Admin Registration/Login', fn: testAdminRegistration },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'Category Creation', fn: testCategoryCreation },
    { name: 'Product Creation', fn: testProductCreation },
    { name: 'Order Creation', fn: testOrderCreation },
    { name: 'Dashboard Stats', fn: testDashboardStats },
    { name: 'All Orders', fn: testAllOrders },
    { name: 'All Users', fn: testAllUsers },
    { name: 'Inventory Overview', fn: testInventoryOverview },
    { name: 'Sales Analytics', fn: testSalesAnalytics },
    { name: 'Non-Admin Access', fn: testNonAdminAccess }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} failed with error:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  console.log('='.repeat(50));
  
  if (passedTests === totalTests) {
    console.log('🎉 All Admin Dashboard API tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Please check the errors above.');
  }
};

// Run tests
runTests().catch(console.error); 