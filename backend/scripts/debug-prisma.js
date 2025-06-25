const { execSync } = require('child_process');

console.log('🔧 Debugging Prisma setup...');

try {
  const commands = [
    'npx prisma generate',
    'npx prisma db push --accept-data-loss',
    'npx prisma db seed'
  ];
  
  for (const command of commands) {
    console.log(`\n📋 Running: ${command}`);
    try {
      execSync(command, { 
        stdio: 'inherit',
        env: {
          ...process.env,
          DATABASE_URL: 'postgresql://postgres:postgres@ecommerce-postgres:5432/ecommerce_db'
        }
      });
      console.log(`✅ ${command} completed successfully`);
    } catch (error) {
      console.error(`❌ ${command} failed:`, error.message);
    }
  }
} catch (error) {
  console.error('❌ Debug failed:', error.message);
} 