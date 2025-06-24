const request = require('supertest');
const app = require('./src/app');

async function testAuth() {
  console.log('Testing authentication system...');
  
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;
  
  try {
    // Test user registration
    console.log('1. Testing user registration...');
    const registerResponse = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User',
        email: testEmail,
        password: 'password123'
      });
    
    console.log('Registration response status:', registerResponse.status);
    console.log('Registration response body:', registerResponse.body);
    
    if (registerResponse.status === 201) {
      const { token } = registerResponse.body;
      
      // Test user login
      console.log('\n2. Testing user login...');
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: testEmail,
          password: 'password123'
        });
      
      console.log('Login response status:', loginResponse.status);
      console.log('Login response body:', loginResponse.body);
      
      // Test protected route with token
      console.log('\n3. Testing protected route...');
      const profileResponse = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);
      
      console.log('Profile response status:', profileResponse.status);
      console.log('Profile response body:', profileResponse.body);
      
      console.log('\n✅ Authentication system is working!');
    } else {
      console.log('❌ Registration failed');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth(); 