const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { auth } = require('../middleware/auth');

// Middleware to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get user's cart
router.get('/', auth, asyncHandler(async (req, res) => {
  const userId = req.user.id; // Assuming auth middleware sets req.user

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  if (!cart) {
    // Create empty cart if it doesn't exist
    const newCart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    return res.json(newCart);
  }

  res.json(cart);
}));

// Add item to cart
router.post('/items', auth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ message: 'Invalid product or quantity' });
  }

  // Get or create cart
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: true }
    });
  }

  // Check if product exists and has enough stock
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (product.stock < quantity) {
    return res.status(400).json({ message: 'Insufficient stock' });
  }

  // Check if item already exists in cart
  const existingItem = cart.items.find(item => item.productId === productId);

  if (existingItem) {
    // Update quantity if item exists
    const updatedItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
      include: { product: true }
    });
    return res.json(updatedItem);
  }

  // Add new item to cart
  const newItem = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity
    },
    include: { product: true }
  });

  res.status(201).json(newItem);
}));

// Update cart item quantity
router.put('/items/:itemId', auth, asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const userId = req.user.id;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }

  // Verify cart ownership
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: req.params.itemId },
    include: {
      cart: true,
      product: true
    }
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    return res.status(404).json({ message: 'Cart item not found' });
  }

  // Check stock availability
  if (cartItem.product.stock < quantity) {
    return res.status(400).json({ message: 'Insufficient stock' });
  }

  const updatedItem = await prisma.cartItem.update({
    where: { id: req.params.itemId },
    data: { quantity },
    include: { product: true }
  });

  res.json(updatedItem);
}));

// Remove item from cart
router.delete('/items/:itemId', auth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Verify cart ownership
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: req.params.itemId },
    include: { cart: true }
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    return res.status(404).json({ message: 'Cart item not found' });
  }

  await prisma.cartItem.delete({
    where: { id: req.params.itemId }
  });

  res.status(204).send();
}));

// Clear cart
router.delete('/', auth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const cart = await prisma.cart.findUnique({
    where: { userId }
  });

  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });
  }

  res.status(204).send();
}));

module.exports = router; 