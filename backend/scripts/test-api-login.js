const axios = require('axios');

const testApiLogin = async () => {
  try {
    console.log('🔐 Testing admin login through API...\n');
    
    const loginData = {
      email: 'admin@example.com',
      password: 'admin123'
    };
    
    console.log('📤 Sending login request...');
    console.log('   Email:', loginData.email);
    console.log('   Password:', loginData.password);
    console.log('   URL: http://localhost:3001/api/users/login\n');
    
    const response = await axios.post('http://localhost:3001/api/users/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Response Status:', response.status);
    console.log('👤 User Info:');
    console.log('   ID:', response.data.user.id);
    console.log('   Email:', response.data.user.email);
    console.log('   Name:', response.data.user.name);
    console.log('   Role:', response.data.user.role);
    console.log('🔐 JWT Token:', response.data.token);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Test admin-only endpoint
    console.log('🔒 Testing admin-only endpoint...');
    
    const adminResponse = await axios.get('http://localhost:3001/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${response.data.token}`
      }
    });
    
    console.log('✅ Admin dashboard access successful!');
    console.log('📊 Dashboard Status:', adminResponse.status);
    console.log('📈 Dashboard Data:', JSON.stringify(adminResponse.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused. Make sure the backend server is running on port 3001');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
};

testApiLogin(); 