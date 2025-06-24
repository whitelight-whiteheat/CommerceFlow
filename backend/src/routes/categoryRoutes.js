const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { auth, isAdmin } = require('../middleware/auth');

// Middleware to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all categories with their products count
router.get('/', asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  // Transform the response to include productCount
  const transformedCategories = categories.map(category => ({
    ...category,
    productCount: category._count.products
  }));

  res.json(transformedCategories);
}));

// Get single category with its products
router.get('/:id', asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: {
      products: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  res.json(category);
}));

// Create new category (Admin only)
router.post('/', auth, isAdmin, asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  // Check if category name already exists
  const existingCategory = await prisma.category.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } }
  });

  if (existingCategory) {
    return res.status(400).json({ message: 'Category name already exists' });
  }

  const category = await prisma.category.create({
    data: { name }
  });

  res.status(201).json(category);
}));

// Update category (Admin only)
router.put('/:id', auth, isAdmin, asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  // Check if category name already exists (excluding current category)
  const existingCategory = await prisma.category.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
      id: { not: req.params.id }
    }
  });

  if (existingCategory) {
    return res.status(400).json({ message: 'Category name already exists' });
  }

  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: { name }
  });

  res.json(category);
}));

// Delete category (Admin only)
router.delete('/:id', auth, isAdmin, asyncHandler(async (req, res) => {
  // Check if category has products
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { products: true } } }
  });

  if (category._count.products > 0) {
    return res.status(400).json({
      message: 'Cannot delete category with associated products'
    });
  }

  await prisma.category.delete({
    where: { id: req.params.id }
  });

  res.status(204).send();
}));

module.exports = router;