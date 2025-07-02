const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get dashboard overview statistics
const getDashboardStats = async (req, res) => {
  try {
    // Debug: Log user information
    console.log('Dashboard request - User:', {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    });

    console.log('Starting dashboard stats calculation...');

    // Get total counts with error handling
    console.log('Fetching user count...');
    const totalUsers = await prisma.user.count();
    console.log('User count:', totalUsers);

    console.log('Fetching product count...');
    const totalProducts = await prisma.product.count();
    console.log('Product count:', totalProducts);

    console.log('Fetching order count...');
    const totalOrders = await prisma.order.count();
    console.log('Order count:', totalOrders);

    console.log('Fetching category count...');
    const totalCategories = await prisma.category.count();
    console.log('Category count:', totalCategories);

    // Get revenue statistics
    console.log('Fetching revenue stats...');
    let revenueStats = { _sum: { total: null }, _count: 0 };
    try {
      revenueStats = await prisma.order.aggregate({
        where: {
          status: {
            in: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']
          }
        },
        _sum: {
          total: true
        },
        _count: true
      });
      console.log('Revenue stats:', revenueStats);
    } catch (error) {
      console.log('Error fetching revenue stats:', error.message);
      revenueStats = { _sum: { total: null }, _count: 0 };
    }

    // Get orders by status
    console.log('Fetching orders by status...');
    let ordersByStatus = [];
    try {
      ordersByStatus = await prisma.order.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      });
      console.log('Orders by status:', ordersByStatus);
    } catch (error) {
      console.log('Error fetching orders by status:', error.message);
      ordersByStatus = [];
    }

    // Get recent orders (last 10)
    console.log('Fetching recent orders...');
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true
              }
            }
          }
        }
      }
    });
    console.log('Recent orders count:', recentOrders.length);

    // Get low stock products (less than 10 items)
    console.log('Fetching low stock products...');
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lt: 10
        }
      },
      include: {
        category: true
      },
      orderBy: {
        stock: 'asc'
      }
    });
    console.log('Low stock products count:', lowStockProducts.length);

    // Get top selling products (by order count)
    console.log('Fetching top selling products...');
    let topSellingProducts = [];
    let topProductsWithDetails = [];
    
    try {
      topSellingProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      });
      console.log('Top selling products count:', topSellingProducts.length);
    } catch (error) {
      console.log('No order items found, skipping top selling products');
      topSellingProducts = [];
    }

    // Get product details for top sellers
    console.log('Fetching product details for top sellers...');
    if (topSellingProducts.length > 0) {
      topProductsWithDetails = await Promise.all(
        topSellingProducts.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            include: { category: true }
          });
          return {
            ...product,
            totalSold: item._sum.quantity
          };
        })
      );
      console.log('Top products with details count:', topProductsWithDetails.length);
    } else {
      console.log('No top selling products to process');
      topProductsWithDetails = [];
    }

    console.log('Preparing response...');
    res.json({
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalCategories,
        totalRevenue: revenueStats._sum.total || 0,
        totalRevenueOrders: revenueStats._count || 0
      },
      ordersByStatus,
      recentOrders,
      lowStockProducts,
      topSellingProducts: topProductsWithDetails
    });
    console.log('Dashboard stats response sent successfully');
  } catch (error) {
    console.error('Dashboard stats error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

// Get all orders with pagination and filtering
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const search = req.query.search;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        {
          user: {
            name: { contains: search, mode: 'insensitive' }
          }
        },
        {
          user: {
            email: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }

    // Get total count
    const total = await prisma.order.count({ where });

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true
              }
            }
          }
        },
        history: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Get all users with pagination and filtering
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;
    const role = req.query.role;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (role) {
      where.role = role;
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get inventory overview
const getInventoryOverview = async (req, res) => {
  try {
    // Get products with low stock
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lt: 10
        }
      },
      include: {
        category: true
      },
      orderBy: {
        stock: 'asc'
      }
    });

    // Get out of stock products
    const outOfStockProducts = await prisma.product.findMany({
      where: {
        stock: 0
      },
      include: {
        category: true
      }
    });

    // Get stock statistics
    const stockStats = await prisma.product.aggregate({
      _sum: {
        stock: true
      },
      _avg: {
        stock: true
      },
      _count: true
    });

    // Get products by category with stock info
    const productsByCategory = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        },
        products: {
          select: {
            id: true,
            name: true,
            stock: true,
            price: true
          }
        }
      }
    });

    res.json({
      lowStockProducts,
      outOfStockProducts,
      stockStats: {
        totalStock: stockStats._sum.stock || 0,
        averageStock: stockStats._avg.stock || 0,
        totalProducts: stockStats._count || 0
      },
      productsByCategory
    });
  } catch (error) {
    console.error('Inventory overview error:', error);
    res.status(500).json({ message: 'Error fetching inventory overview' });
  }
};

// Get sales analytics
const getSalesAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Get sales data for the period
    const salesData = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: daysAgo
        },
        status: {
          in: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                category: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Calculate daily sales
    const dailySales = {};
    salesData.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = {
          total: 0,
          orders: 0,
          items: 0
        };
      }
      dailySales[date].total += order.total;
      dailySales[date].orders += 1;
      dailySales[date].items += order.items.reduce((sum, item) => sum + item.quantity, 0);
    });

    // Get top selling categories
    const categorySales = {};
    salesData.forEach(order => {
      order.items.forEach(item => {
        const categoryName = item.product.category.name;
        if (!categorySales[categoryName]) {
          categorySales[categoryName] = {
            total: 0,
            items: 0
          };
        }
        categorySales[categoryName].total += item.price * item.quantity;
        categorySales[categoryName].items += item.quantity;
      });
    });

    // Convert to arrays and sort
    const dailySalesArray = Object.entries(dailySales).map(([date, data]) => ({
      date,
      ...data
    }));

    const categorySalesArray = Object.entries(categorySales).map(([category, data]) => ({
      category,
      ...data
    })).sort((a, b) => b.total - a.total);

    res.json({
      period: `${period} days`,
      totalSales: salesData.reduce((sum, order) => sum + order.total, 0),
      totalOrders: salesData.length,
      totalItems: salesData.reduce((sum, order) => 
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      ),
      dailySales: dailySalesArray,
      topCategories: categorySalesArray.slice(0, 5)
    });
  } catch (error) {
    console.error('Sales analytics error:', error);
    res.status(500).json({ message: 'Error fetching sales analytics' });
  }
};

// Get comprehensive analytics data
const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Get sales data for the period
    const salesData = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: daysAgo
        },
        status: {
          in: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                category: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Calculate total sales and orders
    const totalSales = salesData.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = salesData.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calculate daily sales
    const dailySales = {};
    salesData.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = {
          total: 0,
          orders: 0
        };
      }
      dailySales[date].total += order.total;
      dailySales[date].orders += 1;
    });

    // Convert to array and sort by date
    const salesByMonth = Object.entries(dailySales)
      .map(([date, data]) => ({
        month: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: data.total
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));

    // Get top selling products
    const productSales = {};
    salesData.forEach(order => {
      order.items.forEach(item => {
        const productName = item.product.name;
        if (!productSales[productName]) {
          productSales[productName] = 0;
        }
        productSales[productName] += item.price * item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    // Get user registration analytics
    const userRegistrations = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: {
          gte: daysAgo
        }
      }
    });

    const userRegistrationsByMonth = userRegistrations
      .map(reg => ({
        month: reg.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: reg._count
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));

    res.json({
      totalSales,
      totalOrders,
      averageOrderValue,
      topProducts,
      salesByMonth,
      userRegistrationsByMonth
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  getAllUsers,
  getInventoryOverview,
  getSalesAnalytics,
  getAnalytics
}; 