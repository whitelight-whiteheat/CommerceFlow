// Test script to diagnose login endpoint issues
require('dotenv').config();

const { ENV_CONFIG, validateEnvironment } = require('./src/config/constants');
const { generateToken, verifyToken } = require('./src/utils/jwtUtils');
const bcrypt = require('bcryptjs');

console.log('🔍 Testing Login Endpoint Issues\n');

// Test 1: Environment Variables
console.log('1. Environment Variables Check:');
try {
  validateEnvironment();
  console.log('✅ Environment validation passed');
  console.log('JWT_SECRET:', ENV_CONFIG.JWT_SECRET ? 'SET' : 'NOT SET');
  console.log('DATABASE_URL:', ENV_CONFIG.DATABASE_URL ? 'SET' : 'NOT SET');
} catch (error) {
  console.log('❌ Environment validation failed:', error.message);
}

// Test 2: JWT Token Generation
console.log('\n2. JWT Token Generation Test:');
try {
  const testPayload = { id: 'test-user-id' };
  const token = generateToken(testPayload);
  console.log('✅ JWT token generated successfully');
  console.log('Token preview:', token.substring(0, 20) + '...');
  
  // Test token verification
  const decoded = verifyToken(token);
  console.log('✅ JWT token verified successfully');
  console.log('Decoded payload:', decoded);
} catch (error) {
  console.log('❌ JWT token test failed:', error.message);
}

// Test 3: Password Hashing
console.log('\n3. Password Hashing Test:');
try {
  const testPassword = 'testpassword123';
  const hashedPassword = bcrypt.hashSync(testPassword, 10);
  console.log('✅ Password hashing successful');
  
  const isMatch = bcrypt.compareSync(testPassword, hashedPassword);
  console.log('✅ Password verification successful:', isMatch);
} catch (error) {
  console.log('❌ Password hashing test failed:', error.message);
}

// Test 4: Database Connection
console.log('\n4. Database Connection Test:');
const prisma = require('./src/config/database');

async function testDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log('✅ Database query successful, user count:', userCount);
    
    await prisma.$disconnect();
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  }
}

testDatabase();

console.log('\n🔧 Next Steps:');
console.log('- If environment validation fails, create a .env file');
console.log('- If JWT fails, check JWT_SECRET configuration');
console.log('- If database fails, check DATABASE_URL and PostgreSQL connection');
console.log('- If all tests pass, the issue might be in the route handlers'); 