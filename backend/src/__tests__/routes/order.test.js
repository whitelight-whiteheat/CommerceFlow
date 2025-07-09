const request = require('supertest');
const app = require('../../src/app');
const { createTestUser, createTestCategory, createTestProduct, createTestCart } = require('../../test/setup');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'portfolio-demo-secret';

const prisma = new PrismaClient();

//test the order routes
describe('Order Routes', () => {
  let userToken;
  let adminToken;
  let user;
  let admin;
  let category;
  let product;
  let cart;
  let order;

  beforeEach(async () => {
    // Create test users
    user = await createTestUser('USER');
    admin = await createTestUser('ADMIN');
    userToken = jwt.sign({ userId: user.id }, JWT_SECRET);
    adminToken = jwt.sign({ userId: admin.id }, JWT_SECRET);
    
    // Create test category and product
    category = await createTestCategory();
    product = await createTestProduct(category.id);
    
    // Add items to cart
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: product.id, quantity: 2 })
      .expect(201);
  });

  describe('GET /api/orders', () => {
    beforeEach(async () => {
      // Create an order first
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);
    });

    it('should get user orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('status');
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/orders')
        .expect(401);
    });

    it('should only return orders for the authenticated user', async () => {
      // Create another user and their order
      const otherUser = await createTestUser('USER');
      const otherUserToken = jwt.sign({ userId: otherUser.id }, JWT_SECRET);

      // Create cart and order for other user
      const otherCart = await createTestCart(otherUser.id);
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ productId: product.id, quantity: 1 })
        .expect(201);

      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(201);

      // Get orders for original user
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Should only see original user's orders
      expect(response.body.length).toBe(1);
      expect(response.body[0].userId).toBe(user.id);
    });
  });

  describe('GET /api/orders/:id', () => {
    beforeEach(async () => {
      // Create an order first
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      order = response.body;
    });

    it('should get a single order', async () => {
      const response = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', order.id);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('items');
    });

    it('should not allow accessing other users orders', async () => {
      const otherUser = await createTestUser('USER');
      const otherUserToken = jwt.sign({ userId: otherUser.id }, JWT_SECRET);

      await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent order', async () => {
      await request(app)
        .get('/api/orders/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('POST /api/orders', () => {
    it('should create order from cart', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status', 'PENDING');
      expect(response.body).toHaveProperty('items');
      expect(response.body.items).toHaveLength(1);
    });

    it('should not create order with empty cart', async () => {
      // Clear cart first
      await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);

      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });

    it('should validate stock availability', async () => {
      // Update product stock to 1
      await prisma.product.update({ 
        where: { id: product.id }, 
        data: { stock: 1 } 
      });

      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });

    it('should clear cart after successful order creation', async () => {
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      // Check that cart is empty
      const cartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(cartResponse.body.items).toHaveLength(0);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    beforeEach(async () => {
      // Create an order first
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      order = response.body;
    });

    it('should update order status (admin only)', async () => {
      const response = await request(app)
        .patch(`/api/orders/${order.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'PROCESSING' })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'PROCESSING');
    });

    it('should not allow non-admin users to update status', async () => {
      await request(app)
        .patch(`/api/orders/${order.id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'PROCESSING' })
        .expect(403);
    });

    it('should validate order status values', async () => {
      await request(app)
        .patch(`/api/orders/${order.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });
  });

  describe('POST /api/orders/:id/cancel', () => {
    let originalStock;

    beforeEach(async () => {
      // Get original stock before creating order
      const originalProduct = await prisma.product.findUnique({ where: { id: product.id } });
      originalStock = originalProduct.stock;

      // Create an order first
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      order = response.body;
    });

    it('should cancel pending order', async () => {
      const response = await request(app)
        .post(`/api/orders/${order.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'CANCELLED');
    });

    it('should restore product stock after cancellation', async () => {
      await request(app)
        .post(`/api/orders/${order.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Check that stock was restored to original value
      const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
      expect(updatedProduct.stock).toBe(originalStock); // Should be back to original stock
    });

    it('should not allow cancelling non-pending orders', async () => {
      // Update order status to PROCESSING
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PROCESSING' }
      });

      await request(app)
        .post(`/api/orders/${order.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });

    it('should not allow cancelling other users orders', async () => {
      const otherUser = await createTestUser('USER');
      const otherUserToken = jwt.sign({ userId: otherUser.id }, JWT_SECRET);

      await request(app)
        .post(`/api/orders/${order.id}/cancel`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(404);
    });
  });
});