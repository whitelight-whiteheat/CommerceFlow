const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const setupAdmin = async () => {
  try {
    console.log('🔧 Setting up admin user...\n');

    // Test database connection
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');

    // Check if admin user already exists
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
      
      // Test login with existing admin
      console.log('🔐 Testing login with existing admin...');
      const testLogin = await testAdminLogin('admin@example.com', 'admin123');
      return;
    }

    // Create admin user
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

    // Test login
    console.log('🔐 Testing admin login...');
    await testAdminLogin('admin@example.com', 'admin123');

  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    
    if (error.code === 'P1001') {
      console.log('\n🔧 Database connection failed. Please ensure:');
      console.log('   1. PostgreSQL is running on localhost:5432');
      console.log('   2. Database "ecommerce_db" exists');
      console.log('   3. User "postgres" with password "postgres" exists');
      console.log('\n💡 Try running: docker-compose up -d postgres');
    }
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
      'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 JWT Token:');
    console.log(token);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 Next steps:');
    console.log('   1. Start the backend server: npm start');
    console.log('   2. Start the frontend: cd ../frontend && npm start');
    console.log('   3. Go to http://localhost:3002');
    console.log('   4. Login with: admin@example.com / admin123');

    return true;
  } catch (error) {
    console.error('❌ Login test failed:', error);
    return false;
  }
};

// Run the setup
setupAdmin(); 