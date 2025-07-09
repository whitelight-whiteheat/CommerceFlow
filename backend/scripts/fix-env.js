const fs = require('fs');

const envContent = `# Portfolio Demo Environment Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db"
JWT_SECRET="portfolio-demo-secret"
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="*"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"`;

fs.writeFileSync('.env', envContent);
console.log('✅ Portfolio Demo .env file created successfully!');
console.log('🔐 Demo Credentials: admin@example.com / admin123'); 