const request = require('supertest');
const app = require('../../src/app');
const { createTestUser, createTestCategory, createTestProduct } = require('../../test/setup');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'b40c000ecd38bca4e57e6945e411207843b6945830d81fb4aa24c6f51d11251b';

const prisma = new PrismaClient();

describe('Category Routes', () => {
  let admin, user, adminToken, userToken, category;

  beforeEach(async () => {
    // Create admin and regular user
    admin = await createTestUser('ADMIN');
    user = await createTestUser('USER');
    
    // Create tokens
    adminToken = jwt.sign({ userId: admin.id }, JWT_SECRET);
    userToken = jwt.sign({ userId: user.id }, JWT_SECRET);

    // Create test category
    category = await createTestCategory();
  });

  describe('GET /api/categories', () => {
    it('should get all categories with product counts', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('productCount');
    });

    it('should return categories in alphabetical order', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      const names = response.body.map(cat => cat.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should get a single category with its products', async () => {
      const response = await request(app)
        .get(`/api/categories/${category.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', category.id);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    it('should return 404 for non-existent category', async () => {
      await request(app)
        .get('/api/categories/non-existent-id')
        .expect(404);
    });
  });

  describe('POST /api/categories', () => {
    it('should create a new category (admin only)', async () => {
      const newCategory = {
        name: 'New Category'
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newCategory)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newCategory.name);
    });

    it('should not allow non-admin users to create categories', async () => {
      const newCategory = {
        name: 'New Category'
      };

      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newCategory)
        .expect(403);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should not allow duplicate category names', async () => {
      // First create a category with a specific name
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Duplicate Test Category' })
        .expect(201);

      // Try to create another category with the same name
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Duplicate Test Category' })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Category name already exists');
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update a category (admin only)', async () => {
      const updateData = {
        name: 'Updated Category'
      };

      const response = await request(app)
        .put(`/api/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
    });

    it('should not allow non-admin users to update categories', async () => {
      const updateData = {
        name: 'Updated Category'
      };

      await request(app)
        .put(`/api/categories/${category.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should not allow updating to duplicate category name', async () => {
      // Create another category first with a specific name
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Another Category Name' })
        .expect(201);

      // Try to update the first category to have the same name
      const response = await request(app)
        .put(`/api/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Another Category Name' })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Category name already exists');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete a category (admin only)', async () => {
      await request(app)
        .delete(`/api/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Verify category is deleted
      await request(app)
        .get(`/api/categories/${category.id}`)
        .expect(404);
    });

    it('should not allow non-admin users to delete categories', async () => {
      await request(app)
        .delete(`/api/categories/${category.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should not allow deleting category with associated products', async () => {
      // Create a product in the category
      await createTestProduct(category.id);

      await request(app)
        .delete(`/api/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });
}); 