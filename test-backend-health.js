const axios = require('axios');

const API_BASE_URL = 'https://resourceful-connection-production.up.railway.app/api';

async function testBackendHealth() {
  console.log('Testing backend health...');
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Health endpoint:', healthResponse.data);
    
    // Test products endpoint (should work without auth)
    console.log('\n2. Testing products endpoint...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products`);
    console.log('✅ Products endpoint:', productsResponse.status, productsResponse.data.products?.length || 0, 'products');
    
    // Test cart endpoint without auth (should fail with 401)
    console.log('\n3. Testing cart endpoint without auth...');
    try {
      await axios.get(`${API_BASE_URL}/cart`);
      console.log('❌ Cart endpoint should require auth but didn\'t');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Cart endpoint correctly requires authentication');
      } else {
        console.log('❌ Cart endpoint error:', error.response?.status, error.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testBackendHealth(); 