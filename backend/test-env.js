// Test environment variable loading
console.log('🔍 Testing Environment Variable Loading\n');

console.log('1. Before dotenv.config():');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

console.log('\n2. Loading dotenv...');
require('dotenv').config();

console.log('\n3. After dotenv.config():');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

console.log('\n4. All environment variables:');
Object.keys(process.env).filter(key => key.startsWith('JWT_') || key.startsWith('DATABASE_')).forEach(key => {
  console.log(`   ${key}: ${process.env[key] ? 'SET' : 'NOT SET'}`);
});

console.log('\n5. Check .env file content:');
const fs = require('fs');
const path = require('path');

try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  console.log('   .env file has', lines.length, 'non-empty lines');
  lines.forEach((line, index) => {
    const [key] = line.split('=');
    console.log(`   Line ${index + 1}: ${key}=...`);
  });
} catch (error) {
  console.log('   Error reading .env file:', error.message);
} 