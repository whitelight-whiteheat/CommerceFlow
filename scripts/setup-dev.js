#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up CommerceFlow development environment...\n');

// Check if .env files exist
const backendEnvPath = path.join(__dirname, '../backend/.env');
const frontendEnvPath = path.join(__dirname, '../frontend/.env');

// Backend environment setup
if (!fs.existsSync(backendEnvPath)) {
  console.log('📝 Creating backend .env file...');
  const backendEnvContent = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/commerceflow"

# JWT
JWT_SECRET="dev-secret-key-change-in-production"
JWT_EXPIRES_IN="24h"
JWT_ISSUER="commerceflow-api"
JWT_AUDIENCE="commerceflow-users"

# Server
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Security
CORS_ORIGIN="http://localhost:3000"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Performance
CACHE_TTL=300000
ENABLE_METRICS=true
`;
  
  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log('✅ Backend .env created');
} else {
  console.log('✅ Backend .env already exists');
}

// Frontend environment setup
if (!fs.existsSync(frontendEnvPath)) {
  console.log('📝 Creating frontend .env file...');
  const frontendEnvContent = `REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
`;
  
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Frontend .env created');
} else {
  console.log('✅ Frontend .env already exists');
}

console.log('\n🎉 Development environment setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Update the DATABASE_URL in backend/.env with your PostgreSQL connection');
console.log('2. Run: npm run install:all');
console.log('3. Run: npm run dev');
console.log('\n⚠️  Note: Change JWT_SECRET in production!'); 