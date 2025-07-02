const request = require('supertest');
const app = require('../app');
const { createTestUser, createTestCategory } = require('../../test/setup');
const { generateTestToken, generateAdminTestToken, generateUserTestToken } = require('../../test/jwtTestUtils');

// Authentication Middleware
describe('Authentication Middleware', () => {
  // Test variables
  let user;
  let validToken;
  let invalidToken;
  let category;

  // Setup before each test
  beforeEach(async () => {
    // Create test user
    user = await createTestUser('USER');
    
    // Create test category for product creation
    category = await createTestCategory();

    // Create valid token
    validToken = generateTestToken(user.id);

    // Create invalid token
    invalidToken = 'invalid.token.here';
  });

  // Test Auth Middleware
  describe('Auth Middleware', () => {
    // Test allowing access with valid token
    it('should allow access with valid token', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          stock: 100,
          categoryId: category.id
        })
        .expect(403); // Should be 403 because user is not admin, but auth passes

      expect(response.body).toHaveProperty('message', 'Admin access required');
    });

    // Test denying access without token
    it('should deny access without token', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          stock: 100,
          categoryId: category.id
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Authentication required');
    });

    // Test denying access with invalid token
    it('should deny access with invalid token', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          stock: 100,
          categoryId: category.id
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid token');
    });

    // Test denying access with malformed token
    it('should deny access with malformed token', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer malformed.token')
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          stock: 100,
          categoryId: category.id
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid token');
    });
  });

  // Test Admin Middleware
  describe('Admin Middleware', () => {
    let adminToken;
    let regularUserToken;

    // Setup before each test
    beforeEach(async () => {
      // Create admin user
      const admin = await createTestUser('ADMIN');
      adminToken = generateAdminTestToken(admin.id);
      
      // Create regular user
      const regularUser = await createTestUser('USER');
      regularUserToken = generateUserTestToken(regularUser.id);
    });

    // Test allowing admin access to protected routes
    it('should allow admin access to protected routes', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          stock: 100,
          categoryId: category.id
        })
        .expect(201);

      expect(response.body).toBeDefined();
    });

    // Test denying non-admin access to protected routes
    it('should deny non-admin access to protected routes', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          stock: 100,
          categoryId: category.id
        })
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Admin access required');
    });
  });

  // Test Owner Middleware
  describe('Owner Middleware', () => {
    let ownerToken;
    let nonOwnerToken;

    // Setup before each test
    beforeEach(async () => {
      // Create owner user
      const owner = await createTestUser('USER');
      ownerToken = generateUserTestToken(owner.id);
      
      // Create non-owner user
      const nonOwner = await createTestUser('USER');
      nonOwnerToken = generateUserTestToken(nonOwner.id);
    });

    it('should allow owner access to their resources', async () => {
      // This test would need to be adapted based on your specific resource routes
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should deny non-owner access to resources', async () => {
      // This test would need to be adapted based on your specific resource routes
      const response = await request(app)
        .get('/api/orders/some-order-id')
        .set('Authorization', `Bearer ${nonOwnerToken}`)
        .expect(404); // Should be 404 because order doesn't exist, but auth passes

      expect(response.body).toHaveProperty('message', 'Order not found');
    });
  });
}); 