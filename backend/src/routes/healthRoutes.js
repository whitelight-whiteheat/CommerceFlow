const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

/**
 * Basic health check endpoint
 */
router.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'CommerFlow API',
    version: '1.0.0'
  });
});

/**
 * Database health check endpoint
 */
router.get('/db', async (req, res) => {
  try {
    // Test basic database connection and get counts
    const [userCount, productCount, orderCount, categoryCount] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.category.count()
    ]);
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        userCount,
        productCount,
        orderCount,
        categoryCount
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error.message
      }
    });
  }
});

/**
 * System health check endpoint
 */
router.get('/system', (req, res) => {
  const systemInfo = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    },
    uptime: Math.round(process.uptime())
  };

  res.status(200).json(systemInfo);
});

module.exports = router; 