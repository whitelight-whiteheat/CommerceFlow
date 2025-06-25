const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const testLogin = async () => {
  try {
    console.log('🔐 Testing admin login directly...\n');
    
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
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   ID:', user.id);
    
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
      'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '7d' }
    );
    
    console.log('\n🎉 Login successful!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 JWT Token:');
    console.log(token);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📋 You can now:');
    console.log('   1. Use this token in your frontend');
    console.log('   2. Test admin endpoints with this token');
    console.log('   3. Login with: admin@example.com / admin123');
    
  } catch (error) {
    console.error('❌ Login test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
};

testLogin(); 