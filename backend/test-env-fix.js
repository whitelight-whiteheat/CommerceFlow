// Test the environment loading fix
console.log('🔍 Testing Environment Loading Fix\n');

// Load environment using our custom loader
const { initializeEnvironment } = require('./src/utils/envLoader');
initializeEnvironment();

// Test environment variables
console.log('Environment Variables After Fix:');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');

// Test JWT functionality
console.log('\n🔧 Testing JWT Functionality:');
try {
  const jwt = require('jsonwebtoken');
  const testPayload = { id: 'test-user', email: 'test@example.com' };
  
  const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
  console.log('   ✅ JWT token generated successfully');
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('   ✅ JWT token verified successfully');
  console.log('   Decoded payload:', decoded);
  
} catch (error) {
  console.log('   ❌ JWT test failed:', error.message);
}

// Test configuration loading
console.log('\n🔧 Testing Configuration Loading:');
try {
  const { ENV_CONFIG } = require('./src/config/constants');
  console.log('   ✅ Configuration loaded successfully');
  console.log('   JWT_SECRET from config:', ENV_CONFIG.JWT_SECRET ? 'SET' : 'NOT SET');
  console.log('   DATABASE_URL from config:', ENV_CONFIG.DATABASE_URL ? 'SET' : 'NOT SET');
  console.log('   PORT from config:', ENV_CONFIG.PORT);
} catch (error) {
  console.log('   ❌ Configuration loading failed:', error.message);
}

console.log('\n✅ Environment fix test complete!'); 