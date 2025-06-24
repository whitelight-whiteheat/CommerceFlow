const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Simple admin user creation (for testing without database)
const createAdminUser = () => {
  const adminUser = {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'ADMIN'
  };

  console.log('✅ Admin User Created:');
  console.log('Email:', adminUser.email);
  console.log('Password:', adminUser.password);
  console.log('Role:', adminUser.role);
  console.log('\n📝 Use these credentials to login to the admin dashboard');
  console.log('🌐 Frontend URL: http://localhost:3002');
  console.log('🔧 Backend URL: http://localhost:3001');
  
  return adminUser;
};

// Simulate login
const loginAdmin = (email, password) => {
  const adminUser = createAdminUser();
  
  if (email === adminUser.email && password === adminUser.password) {
    const token = jwt.sign(
      { 
        userId: adminUser.id, 
        email: adminUser.email, 
        role: adminUser.role 
      },
      'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '24h' }
    );
    
    console.log('\n✅ Login successful!');
    console.log('Token:', token);
    return { success: true, token, user: adminUser };
  } else {
    console.log('\n❌ Login failed!');
    console.log('Please use the correct credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    return { success: false };
  }
};

// Test the login
console.log('🔐 Testing Admin Login...\n');
loginAdmin('admin@example.com', 'admin123');

console.log('\n📋 Instructions:');
console.log('1. Make sure your backend server is running on port 3001');
console.log('2. Make sure your frontend is running on port 3002');
console.log('3. Go to http://localhost:3002');
console.log('4. Login with: admin@example.com / admin123'); 