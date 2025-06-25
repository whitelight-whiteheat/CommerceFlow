const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validateAdminRole } = require('../middleware/validators');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Debug: Check if validateAdminRole is imported correctly
console.log('validateAdminRole:', typeof validateAdminRole, validateAdminRole);

const {
  getDashboardStats,
  getAllOrders,
  getAllUsers,
  getInventoryOverview,
  getSalesAnalytics,
  getAnalytics
} = require('../controllers/adminController');

// Apply authentication and admin role validation to all admin routes
router.use(auth);
router.use(validateAdminRole);

// Dashboard overview statistics
router.get('/dashboard', getDashboardStats);

// Order management
router.get('/orders', getAllOrders);

// User management
router.get('/users', getAllUsers);

// Inventory management
router.get('/inventory', getInventoryOverview);

// Sales analytics
router.get('/analytics/sales', getSalesAnalytics);

// Comprehensive analytics
router.get('/analytics', getAnalytics);

// Product management (Admin-specific)
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, categoryId } = req.query;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get products with total count for pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get all categories for product management
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

module.exports = router; 