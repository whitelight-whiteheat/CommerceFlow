const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const OrderService = require('../services/orderService');
const { auth, isAdmin } = require('../middleware/auth');

// Middleware to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get user's orders
router.get('/', auth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      },
      history: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(orders);
}));

// Get single order
router.get('/:id', auth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      items: {
        include: {
          product: true
        }
      },
      history: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!order || order.userId !== userId) {
    return res.status(404).json({ message: 'Order not found' });
  }

  res.json(order);
}));

// Get order history
router.get('/:id/history', auth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Verify order ownership
  const order = await prisma.order.findUnique({
    where: { id: req.params.id }
  });

  if (!order || order.userId !== userId) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const history = await OrderService.getOrderHistory(req.params.id);
  res.json(history);
}));

// Create order from cart
router.post('/', auth, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user's cart with items
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

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  // Calculate total and verify stock
  let total = 0;
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      return res.status(400).json({
        message: `Not enough stock for ${item.product.name}`
      });
    }
    total += item.product.price * item.quantity;
  }

  // Create order in a transaction
  const order = await prisma.$transaction(async (prisma) => {
    // Create order
    const newOrder = await prisma.order.create({
      data: {
        userId,
        total,
        status: 'PENDING',
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Create initial history entry directly within transaction
    await prisma.orderHistory.create({
      data: {
        orderId: newOrder.id,
        status: 'PENDING',
        note: 'Order created'
      }
    });

    // Update product stock
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    return newOrder;
  });

  res.status(201).json(order);
}));

// Update order status (Admin only)
router.patch('/:id/status', auth, isAdmin, asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const orderId = req.params.id;

  if (!['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const order = await OrderService.updateOrderStatus(orderId, status, note);
  res.json(order);
}));

// Cancel order
router.post('/:id/cancel', auth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  if (!order || order.userId !== userId) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.status !== 'PENDING') {
    return res.status(400).json({
      message: 'Only pending orders can be cancelled'
    });
  }

  // Restore product stock and update order status in a transaction
  const updatedOrder = await prisma.$transaction(async (prisma) => {
    // Restore product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Create history entry directly within transaction
    await prisma.orderHistory.create({
      data: {
        orderId: orderId,
        status: 'CANCELLED',
        note: 'Order cancelled by user'
      }
    });

    return updatedOrder;
  });

  res.json(updatedOrder);
}));

module.exports = router; 