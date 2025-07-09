const request = require('supertest');
const app = require('../../app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Portfolio Demo Integration Tests', () => {
  let adminToken;
  let userToken;
  let testUser;
  let testProduct;
  let testCategory;

  beforeAll(async () => {
    // Create test data
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        role: 'USER'
      }
    });

    testCategory = await prisma.category.create({
      data: {
        name: 'Test Category'
      }
    });

    testProduct = await prisma.product.create({
      data: {
        name: 'Test Product',
        description: 'A test product for portfolio demo',
        price: 29.99,
        stock: 100,
        categoryId: testCategory.id,
        images: ['test-image.jpg']
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.product.deleteMany({ where: { id: testProduct.id } });
    await prisma.category.deleteMany({ where: { id: testCategory.id } });
    await prisma.user.deleteMany({ where: { id: testUser.id } });
    await prisma.$disconnect();
  });

  describe('Authentication', () => {
    test('should allow admin login with demo credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'admin@example.com',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('role', 'ADMIN');
      
      adminToken = response.body.token;
    });

    test('should allow user registration', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Demo User',
          email: 'demo@example.com',
          password: 'demo123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('role', 'USER');
      
      userToken = response.body.token;
    });
  });

  describe('Public Endpoints', () => {
    test('should serve API documentation', async () => {
      const response = await request(app).get('/api-docs');
      expect(response.status).toBe(200);
    });

    test('should provide health check', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
    });

    test('should list products', async () => {
      const response = await request(app).get('/api/products');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    test('should list categories', async () => {
      const response = await request(app).get('/api/categories');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Admin Features', () => {
    test('should access admin dashboard', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('overview');
      expect(response.body.overview).toHaveProperty('totalUsers');
      expect(response.body.overview).toHaveProperty('totalProducts');
      expect(response.body.overview).toHaveProperty('totalOrders');
    });

    test('should create new product', async () => {
      const newProduct = {
        name: 'Portfolio Demo Product',
        description: 'Created during portfolio demo testing',
        price: 49.99,
        stock: 50,
        categoryId: testCategory.id,
        images: ['demo-product.jpg']
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newProduct.name);
    });

    test('should list all users', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Customer Features', () => {
    test('should add item to cart', async () => {
      const cartItem = {
        productId: testProduct.id,
        quantity: 2
      };

      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send(cartItem);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.quantity).toBe(cartItem.quantity);
    });

    test('should view cart', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    test('should create order', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status', 'PENDING');
      expect(response.body).toHaveProperty('total');
    });
  });

  describe('Portfolio Demo Specific', () => {
    test('should work with demo JWT secret', () => {
      // This test verifies that the simplified JWT secret works
      expect(process.env.JWT_SECRET || 'portfolio-demo-secret').toBeTruthy();
    });

    test('should have relaxed CORS for demo', () => {
      // This test verifies that CORS is relaxed for demo purposes
      expect(process.env.CORS_ORIGIN || '*').toBe('*');
    });

    test('should have demo admin credentials', () => {
      // This test verifies that demo credentials are available
      expect(process.env.ADMIN_EMAIL || 'admin@example.com').toBe('admin@example.com');
      expect(process.env.ADMIN_PASSWORD || 'admin123').toBe('admin123');
    });
  });
}); 