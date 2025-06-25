const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testConnection = async () => {
  try {
    console.log('🔧 Testing database connection from backend...\n');
    
    console.log('📡 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');
    
    // Test query
    console.log('📋 Testing query...');
    const userCount = await prisma.user.count();
    console.log(`✅ Query successful! Found ${userCount} users in database.\n`);
    
    // Check for admin user
    console.log('👤 Checking for admin user...');
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@example.com' }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   ID: ${adminUser.id}`);
    } else {
      console.log('❌ Admin user not found');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
};

testConnection(); 