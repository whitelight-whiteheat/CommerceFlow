const { PrismaClient } = require('@prisma/client');

// Create Prisma client with error handling
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty',
});

// Test database connection
const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = { prisma, testConnection }; 