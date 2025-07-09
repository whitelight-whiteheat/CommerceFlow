const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

const completeSetup = async () => {
  try {
    console.log('🚀 Starting complete setup...\n');

    // Step 1: Test database connection
    console.log('📡 Testing database connection...');
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully!\n');
    } catch (error) {
      console.log('❌ Database connection failed. Trying to fix...');
      
      // Try to restart the database container
      console.log('🔄 Restarting PostgreSQL container...');
      try {
        execSync('docker stop ecommerce-postgres', { stdio: 'inherit' });
        execSync('docker rm ecommerce-postgres', { stdio: 'inherit' });
        execSync('docker-compose up -d postgres', { stdio: 'inherit' });
        
        // Wait for database to start
        console.log('⏳ Waiting for database to start...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Try connecting again
        await prisma.$connect();
        console.log('✅ Database connected after restart!\n');
      } catch (restartError) {
        console.error('❌ Failed to restart database:', restartError.message);
        console.log('\n🔧 Manual steps needed:');
        console.log('1. Stop any running PostgreSQL containers');
        console.log('2. Run: docker-compose up -d postgres');
        console.log('3. Wait 10 seconds');
        console.log('4. Run this script again');
        return;
      }
    }

    // Step 2: Push schema
    console.log('📋 Pushing database schema...');
    try {
      execSync('npx prisma db push', { stdio: 'inherit' });
      console.log('✅ Schema pushed successfully!\n');
    } catch (error) {
      console.log('❌ Schema push failed. Trying alternative approach...');
      
      // Try to create tables manually
      console.log('🔧 Creating tables manually...');
      try {
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "User" (
            "id" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "password" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "role" TEXT NOT NULL DEFAULT 'USER',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "User_pkey" PRIMARY KEY ("id")
          );
        `;
        
        await prisma.$executeRaw`
          CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
        `;
        
        console.log('✅ Tables created manually!\n');
      } catch (manualError) {
        console.error('❌ Manual table creation failed:', manualError.message);
        return;
      }
    }

    // Step 3: Check if admin user exists
    console.log('👤 Checking for existing admin user...');
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: 'admin@example.com'
      }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   ID: ${existingAdmin.id}\n`);
    } else {
      // Step 4: Create admin user
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
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // Step 5: Test login
    console.log('🔐 Testing admin login...');
    const testResult = await testAdminLogin('admin@example.com', 'admin123');
    
    if (testResult) {
      console.log('\n🎉 Setup completed successfully!');
      console.log('📋 Next steps:');
      console.log('   1. Start the backend server: npm start');
      console.log('   2. Start the frontend: cd ../frontend && npm start');
      console.log('   3. Go to http://localhost:3000/admin');
      console.log('   4. Login with: admin@example.com / admin123');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
};

const testAdminLogin = async (email, password) => {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ User not found');
      return false;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('❌ Invalid password');
      return false;
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id },
              process.env.JWT_SECRET || 'portfolio-demo-secret',
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 JWT Token:');
    console.log(token);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return true;
  } catch (error) {
    console.error('❌ Login test failed:', error);
    return false;
  }
};

// Run the complete setup
completeSetup(); 