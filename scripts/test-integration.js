const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

async function testIntegration() {
  console.log('🔗 Testing Full Integration\n');
  
  let authToken = null;
  
  // Step 1: Test login
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/users/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    authToken = loginResponse.data.token;
    console.log('✅ Login successful - Token received');
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
    return;
  }
  
  // Step 2: Test admin dashboard with token
  try {
    const dashboardResponse = await axios.get(`${BASE_URL}/api/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Admin dashboard accessible');
    console.log('📊 Dashboard data:', {
      totalUsers: dashboardResponse.data.overview?.totalUsers,
      totalProducts: dashboardResponse.data.overview?.totalProducts,
      totalOrders: dashboardResponse.data.overview?.totalOrders
    });
  } catch (error) {
    console.log('❌ Admin dashboard failed:', error.response?.data?.message || error.message);
  }
  
  // Step 3: Test products endpoint
  try {
    const productsResponse = await axios.get(`${BASE_URL}/api/products`);
    console.log('✅ Products endpoint working');
    console.log('📦 Products count:', productsResponse.data.products?.length || 0);
  } catch (error) {
    console.log('❌ Products endpoint failed:', error.response?.data?.message || error.message);
  }
  
  console.log('\n🏁 Integration Testing Complete');
  console.log('\n🌐 Frontend should be accessible at:', FRONTEND_URL);
  console.log('🔐 Admin login: admin@example.com / admin123');
}

testIntegration(); 