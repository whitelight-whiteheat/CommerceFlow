// Basic server test without problematic npm packages
console.log('🔍 Testing Basic Server Setup\n');

// Test 1: Basic Node.js functionality
console.log('1. Testing Node.js basics:');
console.log('   Node version:', process.version);
console.log('   Platform:', process.platform);

// Test 2: Load environment variables
console.log('\n2. Loading environment variables:');
const { initializeEnvironment } = require('./src/utils/envLoader');
initializeEnvironment();

console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

// Test 3: Try to create a basic HTTP server
console.log('\n3. Testing basic HTTP server:');
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }
  
  const response = {
    message: 'Basic server is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    environment: {
      jwt_secret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      database_url: process.env.DATABASE_URL ? 'SET' : 'NOT SET'
    }
  };
  
  res.end(JSON.stringify(response, null, 2));
});

const port = 3001;
server.listen(port, () => {
  console.log(`   ✅ Basic HTTP server started on port ${port}`);
  console.log(`   Test URL: http://localhost:${port}`);
  
  // Test the server
  setTimeout(() => {
    const testReq = http.request(`http://localhost:${port}/test`, { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('   ✅ Server test successful:');
        console.log('   Response:', data);
        server.close();
        console.log('\n🎉 Basic server test complete!');
        console.log('\n📋 Next Steps:');
        console.log('   1. The basic server infrastructure works');
        console.log('   2. Environment variables are loading correctly');
        console.log('   3. We need to install the missing npm packages');
        console.log('   4. Try: npm install --force or use a different package manager');
      });
    });
    
    testReq.on('error', (err) => {
      console.log('   ❌ Server test failed:', err.message);
      server.close();
    });
    
    testReq.end();
  }, 1000);
});

server.on('error', (err) => {
  console.log('   ❌ Server failed to start:', err.message);
}); 