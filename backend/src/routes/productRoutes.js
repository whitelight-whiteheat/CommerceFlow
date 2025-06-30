const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getPerformanceMetrics
} = require('../controllers/productController');

// Get all products with pagination and filtering
router.get('/', getProducts);

// Get single product by ID
router.get('/:id', getProduct);

// Create new product (Admin only)
router.post('/', auth, isAdmin, createProduct);

// Update product (Admin only)
router.put('/:id', auth, isAdmin, updateProduct);

// Delete product (Admin only)
router.delete('/:id', auth, isAdmin, deleteProduct);

// Get performance metrics (Admin only)
router.get('/metrics/performance', auth, isAdmin, getPerformanceMetrics);

module.exports = router; 