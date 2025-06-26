const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const addSampleData = async () => {
  try {
    console.log('🔧 Adding sample data...');
    
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Create categories
    const electronics = await prisma.category.upsert({
      where: { name: 'Electronics' },
      update: {},
      create: { name: 'Electronics' }
    });
    
    const clothing = await prisma.category.upsert({
      where: { name: 'Clothing' },
      update: {},
      create: { name: 'Clothing' }
    });
    
    const books = await prisma.category.upsert({
      where: { name: 'Books' },
      update: {},
      create: { name: 'Books' }
    });
    
    console.log('✅ Categories created');
    
    // Create products
    const products = [
      {
        name: 'Smartphone',
        description: 'Latest smartphone with advanced features',
        price: 599.99,
        stock: 50,
        categoryId: electronics.id,
        images: ['https://via.placeholder.com/300x300?text=Smartphone']
      },
      {
        name: 'Laptop',
        description: 'High-performance laptop for work and gaming',
        price: 999.99,
        stock: 25,
        categoryId: electronics.id,
        images: ['https://via.placeholder.com/300x300?text=Laptop']
      },
      {
        name: 'T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 19.99,
        stock: 100,
        categoryId: clothing.id,
        images: ['https://via.placeholder.com/300x300?text=T-Shirt']
      },
      {
        name: 'Jeans',
        description: 'Classic blue jeans',
        price: 49.99,
        stock: 75,
        categoryId: clothing.id,
        images: ['https://via.placeholder.com/300x300?text=Jeans']
      },
      {
        name: 'Programming Book',
        description: 'Learn JavaScript programming',
        price: 29.99,
        stock: 30,
        categoryId: books.id,
        images: ['https://via.placeholder.com/300x300?text=Book']
      }
    ];
    
    for (const productData of products) {
      try {
        await prisma.product.create({
          data: productData
        });
      } catch (error) {
        if (error.code === 'P2002') {
          // Duplicate product, skip
          console.log(`⚠️  Product '${productData.name}' already exists, skipping.`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('✅ Sample products created');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 Added 5 sample products');
    console.log('📂 Added 3 categories');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
};

addSampleData(); 