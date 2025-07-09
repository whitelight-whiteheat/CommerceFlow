const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

console.log('🔐 Admin User Setup\n');

// Create admin user data
const adminUser = {
  id: '1',
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'ADMIN'
};

// Hash the password
const hashedPassword = bcrypt.hashSync(adminUser.password, 10);

// Create JWT token
const token = jwt.sign(
  { 
    userId: adminUser.id, 
    email: adminUser.email, 
    role: adminUser.role 
  },
  process.env.JWT_SECRET || 'portfolio-demo-secret',
  { expiresIn: '24h' }
);

console.log('✅ Admin User Created Successfully!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📧 Email: admin@example.com');
console.log('🔑 Password: admin123');
console.log('👤 Role: ADMIN');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔐 JWT Token:');
console.log(token);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('\n📋 Instructions:');
console.log('1. Open your browser and go to: http://localhost:3000/admin');
console.log('2. Use these credentials to login:');
console.log('   Email: admin@example.com');
console.log('   Password: admin123');
console.log('3. If login still fails, the backend might need database setup');
console.log('4. Make sure both frontend (port 3002) and backend (port 3001) are running');

console.log('\n🔧 Troubleshooting:');
console.log('- Frontend URL: http://localhost:3000/admin');
console.log('- Backend URL: http://localhost:3001');
console.log('- Check if both servers are running');
console.log('- If database issues persist, we may need to set up PostgreSQL'); 