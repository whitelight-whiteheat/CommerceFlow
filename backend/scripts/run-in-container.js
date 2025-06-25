const { execSync } = require('child_process');

console.log('🔧 Running Prisma commands from within container...');

try {
  // Run Prisma commands from within a container that has access to the database
  const command = `
    docker run --rm -it \
      --network backend_default \
      -v "${process.cwd()}:/app" \
      -w /app \
      -e DATABASE_URL="postgresql://postgres:postgres@ecommerce-postgres:5432/ecommerce_db" \
      node:18 \
      bash -c "
        cd /app
        npm install
        npx prisma generate
        npx prisma db push
      "
  `;
  
  execSync(command, { stdio: 'inherit' });
  console.log('✅ Prisma commands completed successfully!');
} catch (error) {
  console.error('❌ Failed to run Prisma commands:', error.message);
} 