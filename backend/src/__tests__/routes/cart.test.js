const request = require('supertest');
const app = require('../../src/app');
const { createTestUser, createTestCategory, createTestProduct, createTestCart } = require('../../test/setup');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'b40c000ecd38bca4e57e6945e411207843b6945830d81fb4aa24c6f51d11251b';

const prisma = new PrismaClient();

//test the cart routes
describe('Cart Routes', () => {
  let user, userToken, category, product, cart, cartItem;

  beforeEach(async () => {
    // Create test user
    user = await createTestUser('USER');
    userToken = jwt.sign({ userId: user.id }, JWT_SECRET);

    // Create test category and product
    category = await createTestCategory();
    product = await createTestProduct(category.id);
  });

  //test the get cart route
  describe('GET /api/cart', () => {
    it('should get user cart with items', async () => {
      // Add item to cart first
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 2 })
        .expect(201);

      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('items');
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].productId).toBe(product.id);
      expect(response.body.items[0].quantity).toBe(2);
    });

    //test the create empty cart route
    it('should create empty cart if none exists', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('items');
      expect(response.body.items).toHaveLength(0);
    });

    //test the require authentication route
    it('should require authentication', async () => {
      await request(app)
        .get('/api/cart')
        .expect(401);
    });
  });

  //test the add item to cart route
  describe('POST /api/cart/items', () => {
    it('should add item to cart', async () => {
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 2 })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.productId).toBe(product.id);
      expect(response.body.quantity).toBe(2);
    });

    //test the update quantity if item already exists route
    it('should update quantity if item already exists', async () => {
      // Add item first
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 1 })
        .expect(201);

      // Add same item again
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 2 })
        .expect(200);

      expect(response.body.quantity).toBe(3);
    });

    it('should validate stock availability', async () => {
      // Update product stock to 1
      await prisma.product.update({ 
        where: { id: product.id }, 
        data: { stock: 1 } 
      });

      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 2 })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Insufficient stock');
    });

    //test the validate required fields route
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/cart/items/:itemId', () => {
    beforeEach(async () => {
      // Add item to cart
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 1 })
        .expect(201);

      cartItem = response.body;
    });

    //test the update cart item quantity route
    it('should update cart item quantity', async () => {
      const response = await request(app)
        .put(`/api/cart/items/${cartItem.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 3 })
        .expect(200);

      expect(response.body.quantity).toBe(3);
    });

    //test the validate stock availability route
    it('should validate stock availability', async () => {
      // Update product stock to 1
      await prisma.product.update({ 
        where: { id: product.id }, 
        data: { stock: 1 } 
      });

      const response = await request(app)
        .put(`/api/cart/items/${cartItem.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 2 })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Insufficient stock');
    });

    //test the not allow updating other users cart items route
    it('should not allow updating other users cart items', async () => {
      // Create another user
      const otherUser = await createTestUser('USER');
      const otherUserToken = jwt.sign({ userId: otherUser.id }, JWT_SECRET);

      await request(app)
        .put(`/api/cart/items/${cartItem.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ quantity: 3 })
        .expect(404);
    });
  });

  //test the remove item from cart route
  describe('DELETE /api/cart/items/:itemId', () => {
    beforeEach(async () => {
      // Add item to cart
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 1 })
        .expect(201);

      cartItem = response.body;
    });

    it('should remove item from cart', async () => {
      await request(app)
        .delete(`/api/cart/items/${cartItem.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);

      // Verify item is removed
      const cartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(cartResponse.body.items).toHaveLength(0);
    });

    //test the not allow removing other users cart items route
    it('should not allow removing other users cart items', async () => {
      // Create another user
      const otherUser = await createTestUser('USER');
      const otherUserToken = jwt.sign({ userId: otherUser.id }, JWT_SECRET);

      await request(app)
        .delete(`/api/cart/items/${cartItem.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(404);
    });
  });

  //test the clear all items from cart route
  describe('DELETE /api/cart', () => {
    beforeEach(async () => {
      // Add items to cart
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 1 })
        .expect(201);
    });

    //test the clear all items from cart route
    it('should clear all items from cart', async () => {
      await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);

      // Verify cart is empty
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.items).toHaveLength(0);
    });

    it('should require authentication', async () => {
      await request(app)
        .delete('/api/cart')
        .expect(401);
    });
  });
}); 