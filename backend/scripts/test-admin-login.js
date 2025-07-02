const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const testAdminLogin = async () => {
  try {
    console.log('🔐 Testing admin login...\n');
    
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Find admin user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}\n`);
    
    // Test password
    const isMatch = await bcrypt.compare('admin123', user.password);
    
    if (!isMatch) {
      console.log('❌ Password verification failed');
      return;
    }
    
    console.log('✅ Password verification successful');
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'b40c000ecd38bca4e57e6945e411207843b6945830d81fb4aa24c6f51d11251b',
      { expiresIn: '7d' }
    );
    
    console.log('\n🎉 Admin login test successful!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 JWT Token:');
    console.log(token);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📋 Next steps:');
    console.log('   1. Start the backend server: npm start');
    console.log('   2. Start the frontend: cd ../frontend && npm start');
    console.log('   3. Go to http://localhost:3002');
    console.log('   4. Login with: admin@example.com / admin123');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
};

testAdminLogin(); 