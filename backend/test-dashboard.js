require('dotenv').config();
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testDashboard = async () => {
  try {
    console.log('🔍 Testing Dashboard Endpoint...\n');
    
    // First, test database connection
    console.log('1. Testing database connection...');
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    const categoryCount = await prisma.category.count();
    
    console.log('✅ Database connection successful');
    console.log(`   Users: ${userCount}`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Categories: ${categoryCount}\n`);
    
    // Test login to get a token
    console.log('2. Testing admin login...');
    const loginResponse = await axios.post('http://localhost:3001/api/users/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    console.log(`   Token: ${token.substring(0, 20)}...\n`);
    
    // Test dashboard endpoint
    console.log('3. Testing dashboard endpoint...');
    const dashboardResponse = await axios.get('http://localhost:3001/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Dashboard endpoint successful');
    console.log('   Response status:', dashboardResponse.status);
    console.log('   Response data keys:', Object.keys(dashboardResponse.data));
    
    if (dashboardResponse.data.overview) {
      console.log('   Overview:', dashboardResponse.data.overview);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    
    if (error.code) {
      console.error('   Code:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
};

testDashboard(); 