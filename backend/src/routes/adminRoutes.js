const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validateAdminRole } = require('../middleware/validators');

// Debug: Check if validateAdminRole is imported correctly
console.log('validateAdminRole:', typeof validateAdminRole, validateAdminRole);

const {
  getDashboardStats,
  getAllOrders,
  getAllUsers,
  getInventoryOverview,
  getSalesAnalytics
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

module.exports = router; 