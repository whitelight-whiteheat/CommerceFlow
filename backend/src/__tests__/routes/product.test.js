const request = require('supertest');
const app = require('../../src/app');
const { createTestUser, createTestCategory, createTestProduct } = require('../../test/setup');
const { PrismaClient } = require('@prisma/client');
const { generateAdminTestToken, generateUserTestToken } = require('../../test/jwtTestUtils');

const prisma = new PrismaClient();

// Product Routes
describe('Product Routes', () => {
  let admin, user, adminToken, userToken, category, product;

  // Setup before each test
  beforeEach(async () => {
    // Create admin and regular user
    admin = await createTestUser('ADMIN');
    user = await createTestUser('USER');
    
    // Create tokens using centralized utilities
    adminToken = generateAdminTestToken(admin.id);
    userToken = generateUserTestToken(user.id);
    
    // Create test category
    category = await createTestCategory();
    
    // Create test product
    product = await createTestProduct(category.id);
  });

  // Test GET /api/products
  describe('GET /api/products', () => {
    it('should get all products with pagination', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    // Test filtering products by category
    it('should filter products by category', async () => {
      const response = await request(app)
        .get(`/api/products?categoryId=${category.id}`)
        .expect(200);

      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].categoryId).toBe(category.id);
    });

    // Test searching products by name
    it('should search products by name', async () => {
      const response = await request(app)
        .get('/api/products?search=Test')
        .expect(200);

      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toContain('Test');
    });
  });

  // Test GET /api/products/:id
  describe('GET /api/products/:id', () => {
    // Test getting a single product
    it('should get a single product', async () => {
      const response = await request(app)
        .get(`/api/products/${product.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', product.id);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('category');
    });

    it('should return 404 for non-existent product', async () => {
      await request(app)
        .get('/api/products/non-existent-id')
        .expect(404);
    });
  });

  // Test POST /api/products
  describe('POST /api/products', () => {
    // Test creating a new product (admin only)
    it('should create a new product (admin only)', async () => {
      const newProduct = {
        name: 'New Product',
        description: 'New product description',
        price: 49.99,
        stock: 50,
        categoryId: category.id
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProduct)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newProduct.name);
      expect(response.body.price).toBe(newProduct.price);
    });

    // Test non-admin users cannot create products
    it('should not allow non-admin users to create products', async () => {
      const newProduct = {
        name: 'New Product',
        description: 'New product description',
        price: 49.99,
        stock: 50,
        categoryId: category.id
      };
      // Make request
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newProduct)
        .expect(403);
    });

    // Test validating required fields
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  // Test PUT /api/products/:id
  describe('PUT /api/products/:id', () => {
    // Test updating a product (admin only)
    it('should update a product (admin only)', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 59.99
      };

      const response = await request(app)
        .put(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.price).toBe(updateData.price);
    });

    it('should not allow non-admin users to update products', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 59.99
      };

      await request(app)
        .put(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product (admin only)', async () => {
      await request(app)
        .delete(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Verify product is deleted
      await request(app)
        .get(`/api/products/${product.id}`)
        .expect(404);
    });

    it('should not allow non-admin users to delete products', async () => {
      await request(app)
        .delete(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
}); 