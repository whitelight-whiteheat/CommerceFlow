const { execSync } = require('child_process');

console.log('🚀 Starting backend server in container...');

try {
  const command = `
    docker run --rm -it \
      --network backend_default \
      -v "${process.cwd()}:/app" \
      -w /app \
      -p 3001:3001 \
      -e DATABASE_URL="postgresql://postgres:postgres@ecommerce-postgres:5432/ecommerce_db" \
      -e PORT=3001 \
      node:18 \
      bash -c "
        cd /app
        echo '📦 Installing dependencies...'
        npm install
        
        echo '🔧 Starting backend server...'
        npm start
      "
  `;
  
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to start backend in container:', error.message);
} 