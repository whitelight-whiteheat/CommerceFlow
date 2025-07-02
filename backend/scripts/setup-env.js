const fs = require('fs');
const path = require('path');

// Required JWT secret
const REQUIRED_JWT_SECRET = 'b40c000ecd38bca4e57e6945e411207843b6945830d81fb4aa24c6f51d11251b';

// Environment template
const createEnvContent = (isProduction = false) => {
  const baseContent = `# Environment Configuration
JWT_SECRET="${REQUIRED_JWT_SECRET}"
NODE_ENV="${isProduction ? 'production' : 'development'}"
PORT=3001

# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db"

# JWT Configuration
JWT_EXPIRES_IN="24h"
JWT_ISSUER="ecommerce-api"
JWT_AUDIENCE="ecommerce-users"

# Frontend Configuration
FRONTEND_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:3000"

# Admin Configuration (change these in production!)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Performance Configuration
CACHE_TTL=300000
ENABLE_METRICS=true
METRICS_PORT=9090

# Logging Configuration
LOG_LEVEL="info"
LOG_FORMAT="combined"`;

  if (isProduction) {
    return baseContent.replace(
      'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db"',
      'DATABASE_URL="postgresql://ecommerce_user:${POSTGRES_PASSWORD}@postgres:5432/ecommerce_prod"'
    ).replace(
      'FRONTEND_URL="http://localhost:3000"',
      'FRONTEND_URL="${FRONTEND_URL}"'
    ).replace(
      'CORS_ORIGIN="http://localhost:3000"',
      'CORS_ORIGIN="${FRONTEND_URL}"'
    );
  }

  return baseContent;
};

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('📁 .env file already exists');
  // Read existing .env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace or add JWT_SECRET
  if (envContent.includes('JWT_SECRET=')) {
    envContent = envContent.replace(/JWT_SECRET="[^"]*"/, `JWT_SECRET="${REQUIRED_JWT_SECRET}"`);
  } else {
    envContent += `\nJWT_SECRET="${REQUIRED_JWT_SECRET}"`;
  }
  
  // Add admin configuration if missing
  if (!envContent.includes('ADMIN_EMAIL=')) {
    envContent += `\n\n# Admin Configuration (change these in production!)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ JWT_SECRET set to required value');
  console.log('✅ Admin configuration added/updated');
} else {
  console.log('📝 Creating new .env file');
  const envContent = createEnvContent();
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with required configuration');
}

console.log('\n🔧 Environment setup complete!');
console.log('📋 Next steps:');
console.log('   1. Update DATABASE_URL if using a different database');
console.log('   2. Change ADMIN_EMAIL and ADMIN_PASSWORD for production');
console.log('   3. Start the backend server: npm start');
console.log('   4. Run database migrations: npx prisma migrate dev'); 