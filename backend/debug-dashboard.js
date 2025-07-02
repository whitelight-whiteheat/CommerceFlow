require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

console.log('🔍 Debug Dashboard Issue\n');

// Check environment variables
console.log('1. Environment Variables:');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('');

// Test Prisma connection
console.log('2. Testing Prisma Connection...');
const prisma = new PrismaClient();

prisma.$connect()
  .then(async () => {
    console.log('✅ Prisma connected successfully');
    
    try {
      // Test basic queries
      console.log('3. Testing basic queries...');
      
      const userCount = await prisma.user.count();
      console.log('   User count:', userCount);
      
      const productCount = await prisma.product.count();
      console.log('   Product count:', productCount);
      
      const orderCount = await prisma.order.count();
      console.log('   Order count:', orderCount);
      
      const categoryCount = await prisma.category.count();
      console.log('   Category count:', categoryCount);
      
      // Test the specific query that might be failing
      console.log('4. Testing revenue aggregation...');
      const revenueStats = await prisma.order.aggregate({
        where: {
          status: {
            in: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']
          }
        },
        _sum: {
          total: true
        },
        _count: true
      });
      console.log('   Revenue stats:', revenueStats);
      
      // Test groupBy query
      console.log('5. Testing groupBy query...');
      const ordersByStatus = await prisma.order.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      });
      console.log('   Orders by status:', ordersByStatus);
      
      console.log('\n✅ All queries successful!');
      
    } catch (error) {
      console.error('❌ Query error:', error.message);
      console.error('   Stack:', error.stack);
    }
  })
  .catch((error) => {
    console.error('❌ Prisma connection error:', error.message);
    console.error('   Stack:', error.stack);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n🔚 Disconnected from database');
  }); 