const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const cleanAndAddProducts = async () => {
  try {
    console.log('🧹 Cleaning database and adding fresh products...');
    
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Delete cart items first (due to foreign key constraints)
    console.log('🗑️  Deleting existing cart items...');
    await prisma.cartItem.deleteMany({});
    console.log('✅ All cart items deleted');
    
    // Delete all existing products
    console.log('🗑️  Deleting existing products...');
    await prisma.product.deleteMany({});
    console.log('✅ All products deleted');
    
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
    
    const home = await prisma.category.upsert({
      where: { name: 'Home & Garden' },
      update: {},
      create: { name: 'Home & Garden' }
    });
    
    const sports = await prisma.category.upsert({
      where: { name: 'Sports & Outdoors' },
      update: {},
      create: { name: 'Sports & Outdoors' }
    });
    
    console.log('✅ Categories created');
    
    // Create products with real images
    const products = [
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with titanium design, A17 Pro chip, and advanced camera system',
        price: 999.99,
        stock: 50,
        categoryId: electronics.id,
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
        ]
      },
      {
        name: 'MacBook Pro 16"',
        description: 'Powerful laptop with M3 Pro chip, perfect for professionals and creatives',
        price: 2499.99,
        stock: 25,
        categoryId: electronics.id,
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop'
        ]
      },
      {
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Premium noise-canceling wireless headphones with exceptional sound quality',
        price: 349.99,
        stock: 30,
        categoryId: electronics.id,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop'
        ]
      },
      {
        name: 'Nike Air Max 270',
        description: 'Comfortable running shoes with Air Max technology for maximum cushioning',
        price: 129.99,
        stock: 75,
        categoryId: clothing.id,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop'
        ]
      },
      {
        name: 'Premium Cotton T-Shirt',
        description: 'Soft, breathable cotton t-shirt available in multiple colors',
        price: 24.99,
        stock: 100,
        categoryId: clothing.id,
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop'
        ]
      },
      {
        name: 'Levi\'s 501 Jeans',
        description: 'Classic straight-fit jeans with authentic vintage styling',
        price: 59.99,
        stock: 60,
        categoryId: clothing.id,
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop'
        ]
      },
      {
        name: 'JavaScript: The Definitive Guide',
        description: 'Comprehensive guide to JavaScript programming for all skill levels',
        price: 39.99,
        stock: 40,
        categoryId: books.id,
        images: [
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
        ]
      },
      {
        name: 'React: Up & Running',
        description: 'Learn React development with practical examples and best practices',
        price: 34.99,
        stock: 35,
        categoryId: books.id,
        images: [
          'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
        ]
      },
      {
        name: 'Philips Hue Smart Bulb Set',
        description: 'Smart LED bulbs with 16 million colors, controllable via app',
        price: 79.99,
        stock: 45,
        categoryId: home.id,
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop'
        ]
      },
      {
        name: 'Yoga Mat Premium',
        description: 'Non-slip yoga mat with alignment lines, perfect for home workouts',
        price: 29.99,
        stock: 80,
        categoryId: sports.id,
        images: [
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b8d8b?w=400&h=400&fit=crop'
        ]
      },
      {
        name: 'GoPro Hero 11 Black',
        description: '5.3K video camera with HyperSmooth 5.0 stabilization',
        price: 399.99,
        stock: 20,
        categoryId: electronics.id,
        images: [
          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop'
        ]
      },
      {
        name: 'Wireless Bluetooth Speaker',
        description: 'Portable speaker with 20-hour battery life and waterproof design',
        price: 89.99,
        stock: 55,
        categoryId: electronics.id,
        images: [
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop'
        ]
      }
    ];
    
    for (const productData of products) {
      await prisma.product.create({
        data: productData
      });
      console.log(`✅ Added product: ${productData.name}`);
    }
    
    console.log('✅ Sample products created');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 Added 12 products with real images');
    console.log('📂 Added 5 categories');
    console.log('🖼️  All products now have high-quality images');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error cleaning and adding products:', error);
  } finally {
    await prisma.$disconnect();
  }
};

cleanAndAddProducts(); 