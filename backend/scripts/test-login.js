const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testLogin() {
  console.log('🔐 Testing Admin Login System...\n');

  try {
    // Test 1: Try to register an admin user
    console.log('1. Creating admin user...');
    const registerResponse = await axios.post(`${BASE_URL}/users/register`, {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'ADMIN'
    });
    
    console.log('✅ Admin user created successfully');
    console.log('User ID:', registerResponse.data.user.id);
    
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('ℹ️ Admin user already exists');
    } else {
      console.log('❌ Error creating admin user:', error.response?.data?.message || error.message);
    }
  }

  try {
    // Test 2: Try to login with admin credentials
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', loginResponse.data.token);
    console.log('User:', loginResponse.data.user);
    
    // Test 3: Test protected route
    console.log('\n3. Testing protected route...');
    const protectedResponse = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('✅ Protected route accessible!');
    console.log('Dashboard data:', protectedResponse.data);
    
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
  }

  console.log('\n📋 Login Credentials:');
  console.log('Email: admin@example.com');
  console.log('Password: admin123');
  console.log('\n🌐 Frontend URL: http://localhost:3002');
  console.log('🔧 Backend URL: http://localhost:3001');
}

// Run the test
testLogin().catch(console.error); 