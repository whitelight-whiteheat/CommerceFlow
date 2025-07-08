// Comprehensive backend test
console.log('🔍 Comprehensive Backend Test\n');

// Load environment
const { initializeEnvironment } = require('./src/utils/envLoader');
initializeEnvironment();

console.log('1. Environment Variables:');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

console.log('\n2. Testing Database Connection:');
async function testDatabase() {
  try {
    // Try Prisma first
    console.log('   Trying Prisma client...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$connect();
    const userCount = await prisma.user.count();
    console.log('   ✅ Prisma client working, user count:', userCount);
    await prisma.$disconnect();
    return 'prisma';
  } catch (error) {
    console.log('   ❌ Prisma client failed:', error.message);
    
    // Try fallback database
    try {
      console.log('   Trying fallback database...');
      const { testConnection, userOperations } = require('./src/config/database-fallback');
      const connectionTest = await testConnection();
      
      if (connectionTest.success) {
        console.log('   ✅ Fallback database connection successful');
        const userCount = await userOperations.countUsers();
        console.log('   ✅ User count:', userCount);
        return 'fallback';
      } else {
        console.log('   ❌ Fallback database failed:', connectionTest.error);
        return 'failed';
      }
    } catch (fallbackError) {
      console.log('   ❌ Fallback database failed:', fallbackError.message);
      return 'failed';
    }
  }
}

console.log('\n3. Testing JWT Functionality:');
function testJWT() {
  try {
    const jwt = require('jsonwebtoken');
    const testPayload = { id: 'test-user', email: 'test@example.com' };
    
    const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('   ✅ JWT token generated');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('   ✅ JWT token verified');
    return true;
  } catch (error) {
    console.log('   ❌ JWT test failed:', error.message);
    return false;
  }
}

console.log('\n4. Testing Password Hashing:');
function testPasswordHashing() {
  try {
    const bcrypt = require('bcryptjs');
    const testPassword = 'testpassword123';
    const hashedPassword = bcrypt.hashSync(testPassword, 10);
    console.log('   ✅ Password hashing successful');
    
    const isMatch = bcrypt.compareSync(testPassword, hashedPassword);
    console.log('   ✅ Password verification successful:', isMatch);
    return true;
  } catch (error) {
    console.log('   ❌ Password hashing failed:', error.message);
    return false;
  }
}

console.log('\n5. Testing Express App Loading:');
function testExpressApp() {
  try {
    const express = require('express');
    const app = express();
    console.log('   ✅ Express app created');
    
    // Test basic route
    app.get('/test', (req, res) => {
      res.json({ message: 'Test route working' });
    });
    
    console.log('   ✅ Test route added');
    return app;
  } catch (error) {
    console.log('   ❌ Express app failed:', error.message);
    return null;
  }
}

// Run all tests
async function runAllTests() {
  const dbResult = await testDatabase();
  const jwtResult = testJWT();
  const passwordResult = testPasswordHashing();
  const expressResult = testExpressApp();
  
  console.log('\n📊 Test Results Summary:');
  console.log('   Database:', dbResult === 'prisma' ? '✅ Prisma' : dbResult === 'fallback' ? '⚠️ Fallback' : '❌ Failed');
  console.log('   JWT:', jwtResult ? '✅ Working' : '❌ Failed');
  console.log('   Password Hashing:', passwordResult ? '✅ Working' : '❌ Failed');
  console.log('   Express App:', expressResult ? '✅ Working' : '❌ Failed');
  
  const canStartServer = (dbResult !== 'failed') && jwtResult && passwordResult && expressResult;
  console.log('\n🚀 Can Start Server:', canStartServer ? '✅ YES' : '❌ NO');
  
  if (canStartServer) {
    console.log('\n🔧 Next Steps:');
    console.log('   1. Start the backend server: node src/index.js');
    console.log('   2. Test the login endpoint');
    console.log('   3. Check frontend-backend connection');
  } else {
    console.log('\n🔧 Issues to Fix:');
    if (dbResult === 'failed') console.log('   - Database connection');
    if (!jwtResult) console.log('   - JWT configuration');
    if (!passwordResult) console.log('   - Password hashing');
    if (!expressResult) console.log('   - Express app setup');
  }
}

runAllTests(); 