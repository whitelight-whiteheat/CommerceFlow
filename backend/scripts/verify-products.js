const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const verifyProducts = async () => {
  try {
    console.log('🔍 Verifying products with images...');
    
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Get all products with their categories and images
    const products = await prisma.product.findMany({
      include: {
        category: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`\n📦 Found ${products.length} products:`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Category: ${product.category.name}`);
      console.log(`   Price: $${product.price.toFixed(2)}`);
      console.log(`   Stock: ${product.stock}`);
      console.log(`   Images: ${product.images.length} image(s)`);
      
      if (product.images.length > 0) {
        console.log(`   Image URLs:`);
        product.images.forEach((image, imgIndex) => {
          console.log(`     ${imgIndex + 1}. ${image}`);
        });
      }
      console.log('');
    });
    
    // Get categories
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    
    console.log('📂 Categories and product counts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    categories.forEach(category => {
      console.log(`• ${category.name}: ${category._count.products} products`);
    });
    
    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Error verifying products:', error);
  } finally {
    await prisma.$disconnect();
  }
};

verifyProducts(); 