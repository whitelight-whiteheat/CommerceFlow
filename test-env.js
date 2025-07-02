const axios = require('axios');

const API_BASE_URL = 'https://resourceful-connection-production.up.railway.app/api';

async function testEnvironment() {
  console.log('Testing backend environment...\n');
  
  try {
    // Test health endpoint to see if we can reach the backend
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Backend is reachable');
    
    // Test login to see if JWT_SECRET is working
    console.log('\n2. Testing login (this will show if JWT_SECRET is working)...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/users/login`, {
        email: 'teticw16@gmail.com',
        password: 'admin123'
      });
      console.log('✅ Login successful - JWT_SECRET is working!');
      console.log('Token received:', loginResponse.data.token ? 'Yes' : 'No');
    } catch (loginError) {
      if (loginError.response?.status === 401) {
        console.log('❌ Login failed - invalid credentials');
      } else {
        console.log('❌ Login failed:', loginError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
  }
}

testEnvironment(); 