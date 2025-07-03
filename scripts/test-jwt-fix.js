const axios = require('axios');

const API_BASE_URL = 'https://resourceful-connection-production.up.railway.app/api';

async function testJWTFix() {
  console.log('Testing JWT_SECRET fix...\n');
  
  try {
    // Step 1: Login to get a token
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/users/login`, {
      email: 'teticw16@gmail.com',
      password: 'admin123' // Try this common password
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, got token');
    console.log('Token length:', token.length);
    
    // Step 2: Test cart endpoint with token
    console.log('\n2. Testing cart endpoint with token...');
    const cartResponse = await axios.get(`${API_BASE_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Cart endpoint works!');
    console.log('Cart data:', cartResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      
      if (error.response.status === 401) {
        console.error('🔍 This suggests the JWT_SECRET is still not set correctly');
      }
    }
  }
}

testJWTFix(); 