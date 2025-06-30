const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testEndpoint(endpoint, method = 'GET', data = null, headers = {}) {
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
    console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`);
    return response;
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - Error: ${error.response?.status || error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Testing Backend API Endpoints\n');
  
  // Test 1: Health check
  await testEndpoint('/api-docs');
  
  // Test 2: Admin dashboard (should fail without auth)
  await testEndpoint('/api/admin/dashboard');
  
  // Test 3: Products (public endpoint)
  await testEndpoint('/api/products');
  
  // Test 4: Categories (public endpoint)
  await testEndpoint('/api/categories');
  
  // Test 5: Login endpoint
  await testEndpoint('/api/users/login', 'POST', {
    email: 'admin@example.com',
    password: 'admin123'
  });
  
  console.log('\n🏁 API Testing Complete');
}

runTests(); 