const fs = require('fs');

const envContent = `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NODE_ENV="development"`;

fs.writeFileSync('.env', envContent);
console.log('✅ .env file created successfully!');
console.log('Contents:');
console.log(envContent); 