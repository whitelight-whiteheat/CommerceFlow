const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testAdmin = async () => {
  try {
    console.log('🔧 Testing admin user in container...');
    
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    const user = await prisma.user.findFirst({
      where: { email: 'admin@example.com' }
    });
    
    if (user) {
      console.log('✅ Admin user found:');
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   ID:', user.id);
    } else {
      console.log('❌ Admin user not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
};

testAdmin(); 