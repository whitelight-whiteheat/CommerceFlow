const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { auth, isAdmin } = require('../middleware/auth');

// Middleware to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all products with pagination and filtering
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, categoryId, search } = req.query;
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
}));

// Get single product by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { category: true }
  });

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
}));

// Create new product (Admin only)
router.post('/', auth, isAdmin, asyncHandler(async (req, res) => {
  const { name, description, price, stock, images, categoryId } = req.body;

  // Validate required fields
  if (!name || !description || !price || !categoryId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      images: images || [],
      categoryId
    },
    include: { category: true }
  });

  res.status(201).json(product);
}));

// Update product (Admin only)
router.put('/:id', auth, isAdmin, asyncHandler(async (req, res) => {
  const { name, description, price, stock, images, categoryId } = req.body;

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      ...(name && { name }),
      ...(description && { description }),
      ...(price && { price: parseFloat(price) }),
      ...(stock && { stock: parseInt(stock) }),
      ...(images && { images }),
      ...(categoryId && { categoryId })
    },
    include: { category: true }
  });

  res.json(product);
}));

// Delete product (Admin only)
router.delete('/:id', auth, isAdmin, asyncHandler(async (req, res) => {
  await prisma.product.delete({
    where: { id: req.params.id }
  });

  res.status(204).send();
}));

module.exports = router; 