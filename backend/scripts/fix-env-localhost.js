const fs = require('fs');

const envContent = `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db"
JWT_SECRET="b40c000ecd38bca4e57e6945e411207843b6945830d81fb4aa24c6f51d11251b"
NODE_ENV="development"`;

fs.writeFileSync('.env', envContent);
console.log('✅ .env file updated to use localhost for backend server!');
console.log('Contents:');
console.log(envContent); 