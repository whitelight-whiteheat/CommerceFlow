const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Global setup - runs once before all tests
beforeAll(async () => {
  // Clean up the database before running tests
  await prisma.orderHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
});

// Global teardown - runs once after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Reset database between tests
beforeEach(async () => {
  // Delete in order to respect foreign key constraints
  await prisma.orderHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  
  // Small delay to ensure cleanup is complete
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Helper function to create test user with unique email
const createTestUser = async (role = 'USER', emailSuffix = '') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const uniqueEmail = `test${emailSuffix}${timestamp}${random}@example.com`;
  
  return prisma.user.create({
    data: {
      email: uniqueEmail,
      password: 'hashedpassword123',
      name: 'Test User',
      role: role
    }
  });
};

// Helper function to create test category with unique name
const createTestCategory = async (name = 'Test Category') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const uniqueName = `${name}${timestamp}${random}`;
  
  return prisma.category.create({
    data: {
      name: uniqueName
    }
  });
};

// Helper function to create test product with unique name
const createTestProduct = async (categoryId, name = 'Test Product') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const uniqueName = `${name}${timestamp}${random}`;
  
  return prisma.product.create({
    data: {
      name: uniqueName,
      description: 'Test product description',
      price: 99.99,
      stock: 10,
      categoryId: categoryId
    }
  });
};

// Helper function to create test cart
const createTestCart = async (userId) => {
  return prisma.cart.create({
    data: {
      userId: userId
    }
  });
};

module.exports = {
  prisma,
  createTestUser,
  createTestCategory,
  createTestProduct,
  createTestCart
}; 