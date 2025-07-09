const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { validationResult } = require('express-validator');
const { generateToken } = require('../utils/jwtUtils');
const Logger = require('../utils/logger');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    // Create cart for user
    await prisma.cart.create({
      data: {
        userId: user.id
      }
    });

    const token = generateToken({ id: user.id });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    Logger.error('Registration error', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    Logger.error('Login error', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    Logger.error('Get profile error', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(email && { email })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    Logger.error('Update profile error', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true
              }
            }
          }
        },
        history: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalOrders = await prisma.order.count({
      where: { userId: req.user.id }
    });

    // Get order statistics
    const orderStats = await prisma.order.groupBy({
      by: ['status'],
      where: { userId: req.user.id },
      _count: {
        status: true
      }
    });

    const stats = {
      total: totalOrders,
      pending: orderStats.find(s => s.status === 'PENDING')?._count.status || 0,
      processing: orderStats.find(s => s.status === 'PROCESSING')?._count.status || 0,
      shipped: orderStats.find(s => s.status === 'SHIPPED')?._count.status || 0,
      delivered: orderStats.find(s => s.status === 'DELIVERED')?._count.status || 0,
      cancelled: orderStats.find(s => s.status === 'CANCELLED')?._count.status || 0
    };

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit)
      },
      stats
    });
  } catch (error) {
    Logger.error('Get order history error', error);
    res.status(500).json({ message: 'Error fetching order history' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.json({ users });
  } catch (error) {
    Logger.error('Get all users error', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getOrderHistory,
  getAllUsers
}; 