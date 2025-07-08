// Test if backend server is running
const http = require('http');

console.log('🔍 Testing Backend Server Health\n');

const testEndpoints = [
  { path: '/health', description: 'Health check endpoint' },
  { path: '/api/users/login', description: 'Login endpoint', method: 'POST' },
  { path: '/api/products', description: 'Products endpoint' }
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: endpoint.path,
      method: endpoint.method || 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          endpoint: endpoint.path,
          status: res.statusCode,
          success: res.statusCode < 500,
          description: endpoint.description,
          response: data.substring(0, 200) // First 200 chars
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        endpoint: endpoint.path,
        status: 'ERROR',
        success: false,
        description: endpoint.description,
        error: err.message
      });
    });

    req.on('timeout', () => {
      resolve({
        endpoint: endpoint.path,
        status: 'TIMEOUT',
        success: false,
        description: endpoint.description,
        error: 'Request timeout'
      });
    });

    // For POST requests, send empty body
    if (endpoint.method === 'POST') {
      req.write('{}');
    }
    
    req.end();
  });
}

async function runHealthCheck() {
  console.log('Testing backend server endpoints...\n');
  
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint);
    
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.description}`);
    console.log(`   Endpoint: ${result.endpoint}`);
    console.log(`   Status: ${result.status}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    } else if (result.response) {
      console.log(`   Response: ${result.response}`);
    }
    console.log();
  }
  
  console.log('🔧 Health check complete!');
}

runHealthCheck(); 