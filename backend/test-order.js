const request = require('supertest');
const app = require('./src/app');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testOrderSystem() {
  console.log('Testing Order System...');
  
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;
  const adminEmail = `admin${timestamp}@example.com`;
  
  try {
    // 1. Create admin user directly in database
    console.log('1. Creating admin user...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN'
      }
    });
    
    const adminToken = require('jsonwebtoken').sign(
      { id: adminUser.id },
      'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '7d' }
    );
    
    console.log('✅ Admin user created successfully');
    
    // 2. Register regular user
    console.log('\n2. Registering regular user...');
    const registerResponse = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User',
        email: testEmail,
        password: 'password123'
      });
    
    if (registerResponse.status !== 201) {
      console.log('❌ Registration failed:', registerResponse.body);
      return;
    }
    
    const { token } = registerResponse.body;
    console.log('✅ Regular user registered successfully');
    
    // 3. Create a category (admin only)
    console.log('\n3. Creating category...');
    const categoryResponse = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Category' });
    
    if (categoryResponse.status !== 201) {
      console.log('❌ Category creation failed:', categoryResponse.body);
      return;
    }
    
    const category = categoryResponse.body;
    console.log('✅ Category created successfully');
    
    // 4. Create a product (admin only)
    console.log('\n4. Creating product...');
    const productResponse = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product',
        description: 'Test product description',
        price: 29.99,
        stock: 10,
        categoryId: category.id,
        images: []
      });
    
    if (productResponse.status !== 201) {
      console.log('❌ Product creation failed:', productResponse.body);
      return;
    }
    
    const product = productResponse.body;
    console.log('✅ Product created successfully');
    
    // 5. Add product to cart (regular user)
    console.log('\n5. Adding product to cart...');
    const cartResponse = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product.id,
        quantity: 2
      });
    
    if (cartResponse.status !== 201) {
      console.log('❌ Adding to cart failed:', cartResponse.body);
      return;
    }
    
    console.log('✅ Product added to cart successfully');
    
    // 6. Create order from cart (regular user)
    console.log('\n6. Creating order from cart...');
    const orderResponse = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    
    if (orderResponse.status !== 201) {
      console.log('❌ Order creation failed:', orderResponse.body);
      return;
    }
    
    const order = orderResponse.body;
    console.log('✅ Order created successfully');
    console.log('Order details:', {
      id: order.id,
      total: order.total,
      status: order.status,
      itemCount: order.items.length
    });
    
    // 7. Get user orders (regular user)
    console.log('\n7. Getting user orders...');
    const ordersResponse = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);
    
    if (ordersResponse.status !== 200) {
      console.log('❌ Getting orders failed:', ordersResponse.body);
      return;
    }
    
    console.log('✅ Orders retrieved successfully');
    console.log('Orders count:', ordersResponse.body.length);
    
    // 8. Get single order (regular user)
    console.log('\n8. Getting single order...');
    const singleOrderResponse = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Authorization', `Bearer ${token}`);
    
    if (singleOrderResponse.status !== 200) {
      console.log('❌ Getting single order failed:', singleOrderResponse.body);
      return;
    }
    
    console.log('✅ Single order retrieved successfully');
    
    // 9. Update order status (admin only)
    console.log('\n9. Updating order status...');
    const statusResponse = await request(app)
      .patch(`/api/orders/${order.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'PROCESSING',
        note: 'Order is being processed'
      });
    
    if (statusResponse.status !== 200) {
      console.log('❌ Status update failed:', statusResponse.body);
      return;
    }
    
    console.log('✅ Order status updated successfully');
    
    console.log('\n🎉 Order System is working perfectly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderSystem(); 