const { execSync } = require('child_process');

console.log('🚀 Final setup - running everything from container...');

try {
  const command = `
    docker run --rm -it \
      --network backend_default \
      -v "${process.cwd()}:/app" \
      -w /app \
      -e DATABASE_URL="postgresql://postgres:postgres@ecommerce-postgres:5432/ecommerce_db" \
      node:18 \
      bash -c "
        cd /app
        echo '📦 Installing dependencies...'
        npm install
        
        echo '🔧 Generating Prisma client...'
        npx prisma generate
        
        echo '📋 Pushing database schema...'
        npx prisma db push --accept-data-loss
        
        echo '👤 Creating admin user...'
        node -e \"
          const { PrismaClient } = require('@prisma/client');
          const bcrypt = require('bcryptjs');
          const jwt = require('jsonwebtoken');
          
          const prisma = new PrismaClient();
          
          const setupAdmin = async () => {
            try {
              console.log('🔧 Setting up admin user...\\n');
              
              await prisma.\$connect();
              console.log('✅ Database connected successfully!\\n');
              
              const existingAdmin = await prisma.user.findFirst({
                where: { email: 'admin@example.com' }
              });
              
              if (existingAdmin) {
                console.log('⚠️  Admin user already exists:');
                console.log(\`   Email: \${existingAdmin.email}\`);
                console.log(\`   Role: \${existingAdmin.role}\`);
                console.log(\`   ID: \${existingAdmin.id}\\n\`);
              } else {
                console.log('👤 Creating admin user...');
                const hashedPassword = await bcrypt.hash('admin123', 10);
                
                const adminUser = await prisma.user.create({
                  data: {
                    email: 'admin@example.com',
                    password: hashedPassword,
                    name: 'Admin User',
                    role: 'ADMIN'
                  }
                });
                
                console.log('✅ Admin user created successfully!');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('📧 Email: admin@example.com');
                console.log('🔑 Password: admin123');
                console.log('👤 Role: ADMIN');
                console.log('🆔 ID:', adminUser.id);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n');
              }
              
              // Test login
              console.log('🔐 Testing admin login...');
              const user = await prisma.user.findUnique({
                where: { email: 'admin@example.com' }
              });
              
              if (user) {
                const isMatch = await bcrypt.compare('admin123', user.password);
                if (isMatch) {
                  const token = jwt.sign(
                    { id: user.id },
                    process.env.JWT_SECRET || 'portfolio-demo-secret',
                    { expiresIn: '7d' }
                  );
                  
                  console.log('✅ Login successful!');
                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                  console.log('🔐 JWT Token:');
                  console.log(token);
                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n');
                  
                  console.log('📋 Next steps:');
                  console.log('   1. Start the backend server: npm start');
                  console.log('   2. Start the frontend: cd ../frontend && npm start');
                  console.log('   3. Go to http://localhost:3000/admin');
                  console.log('   4. Login with: admin@example.com / admin123');
                }
              }
              
            } catch (error) {
              console.error('❌ Error:', error);
            } finally {
              await prisma.\$disconnect();
            }
          };
          
          setupAdmin();
        \"
        
        echo '✅ Setup completed!'
      "
  `;
  
  execSync(command, { stdio: 'inherit' });
  console.log('🎉 All done! Your admin user is ready.');
} catch (error) {
  console.error('❌ Setup failed:', error.message);
} 