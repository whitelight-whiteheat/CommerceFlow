const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { urlConfig } = require('./urls');

/**
 * Swagger API documentation configuration
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'CommerFlow E-commerce Platform API',
    version: '1.0.0',
    description: 'API documentation for the CommerFlow E-commerce Platform',
    contact: {
      name: 'CommerFlow API Support',
      email: 'support@commerflow.com'
    }
  },
  servers: urlConfig.getSwaggerServers(),
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for authentication'
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'User ID' },
          name: { type: 'string', description: 'User\'s full name' },
          email: { type: 'string', description: 'User\'s email address' },
          role: { type: 'string', enum: ['USER', 'ADMIN'], description: 'User\'s role' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, description: 'User\'s full name' },
          email: { type: 'string', format: 'email', description: 'User\'s email address' },
          password: { type: 'string', minLength: 6, description: 'User\'s password' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', description: 'User\'s email address' },
          password: { type: 'string', description: 'User\'s password' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string', description: 'JWT authentication token' }
        }
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Product ID' },
          name: { type: 'string', description: 'Product name' },
          description: { type: 'string', description: 'Product description' },
          price: { type: 'number', description: 'Product price' },
          stock: { type: 'integer', description: 'Available stock' },
          categoryId: { type: 'string', description: 'Category ID' },
          images: { type: 'array', items: { type: 'string' }, description: 'Product images' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Order ID' },
          userId: { type: 'string', description: 'User ID' },
          status: { type: 'string', enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] },
          total: { type: 'number', description: 'Order total' },
          items: { type: 'array', items: { type: 'object' }, description: 'Order items' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Cart: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Cart ID' },
          userId: { type: 'string', description: 'User ID' },
          items: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      CartItem: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Cart item ID' },
          cartId: { type: 'string', description: 'Cart ID' },
          productId: { type: 'string', description: 'Product ID' },
          quantity: { type: 'integer', description: 'Quantity in cart' },
          product: { $ref: '#/components/schemas/Product' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Category ID' },
          name: { type: 'string', description: 'Category name' },
          products: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      OrderHistory: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'History entry ID' },
          orderId: { type: 'string', description: 'Order ID' },
          status: { type: 'string', enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] },
          note: { type: 'string', description: 'Optional note' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  paths: {
    '/api/users/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          400: { description: 'Validation error or user already exists' }
        }
      }
    },
    '/api/users/login': {
      post: {
        summary: 'Login user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/api/users/profile': {
      get: {
        summary: 'Get current user\'s profile',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          401: { description: 'Authentication required' }
        }
      },
      put: {
        summary: 'Update current user\'s profile',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 2 },
                  email: { type: 'string', format: 'email' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Profile updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          400: { description: 'Validation error or email already in use' },
          401: { description: 'Authentication required' }
        }
      }
    },
    '/api/users/orders': {
      get: {
        summary: 'Get current user\'s order history',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
            description: 'Page number for pagination'
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 10 },
            description: 'Number of orders per page'
          }
        ],
        responses: {
          200: {
            description: 'Order history retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    orders: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
                    pagination: { type: 'object' }
                  }
                }
              }
            }
          },
          401: { description: 'Authentication required' }
        }
      }
    },
    '/api/products': {
      get: {
        summary: 'Get all products',
        tags: ['Products'],
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
            description: 'Page number for pagination'
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 10 },
            description: 'Number of products per page'
          },
          {
            in: 'query',
            name: 'categoryId',
            schema: { type: 'string' },
            description: 'Filter by category ID'
          },
          {
            in: 'query',
            name: 'search',
            schema: { type: 'string' },
            description: 'Search in product name and description'
          }
        ],
        responses: {
          200: {
            description: 'Products retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    products: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                    pagination: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/dashboard': {
      get: {
        summary: 'Get admin dashboard statistics',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard statistics retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    overview: { type: 'object' },
                    ordersByStatus: { type: 'array' },
                    recentOrders: { type: 'array' },
                    lowStockProducts: { type: 'array' },
                    topSellingProducts: { type: 'array' }
                  }
                }
              }
            }
          },
          401: { description: 'Authentication required' },
          403: { description: 'Admin access required' }
        }
      }
    },
    '/api/products/{id}': {
      get: {
        summary: 'Get product by ID',
        tags: ['Products'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Product ID'
          }
        ],
        responses: {
          200: {
            description: 'Product retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' }
              }
            }
          },
          404: { description: 'Product not found' }
        }
      },
      put: {
        summary: 'Update product (Admin only)',
        tags: ['Products'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Product ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 1 },
                  description: { type: 'string' },
                  price: { type: 'number', minimum: 0 },
                  stock: { type: 'integer', minimum: 0 },
                  categoryId: { type: 'string' },
                  images: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Product updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' }
              }
            }
          },
          400: { description: 'Validation error' },
          401: { description: 'Authentication required' },
          403: { description: 'Admin access required' },
          404: { description: 'Product not found' }
        }
      },
      delete: {
        summary: 'Delete product (Admin only)',
        tags: ['Products'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Product ID'
          }
        ],
        responses: {
          200: { description: 'Product deleted successfully' },
          401: { description: 'Authentication required' },
          403: { description: 'Admin access required' },
          404: { description: 'Product not found' }
        }
      }
    },
    '/api/categories': {
      get: {
        summary: 'Get all categories',
        tags: ['Categories'],
        responses: {
          200: {
            description: 'Categories retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Category' }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create new category (Admin only)',
        tags: ['Categories'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', minLength: 1 }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Category created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Category' }
              }
            }
          },
          400: { description: 'Validation error or category already exists' },
          401: { description: 'Authentication required' },
          403: { description: 'Admin access required' }
        }
      }
    },
    '/api/cart': {
      get: {
        summary: 'Get user cart',
        tags: ['Cart'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Cart retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Cart' }
              }
            }
          },
          401: { description: 'Authentication required' }
        }
      },
      delete: {
        summary: 'Clear user cart',
        tags: ['Cart'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Cart cleared successfully' },
          401: { description: 'Authentication required' }
        }
      }
    },
    '/api/cart/items': {
      post: {
        summary: 'Add item to cart',
        tags: ['Cart'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'integer', minimum: 1 }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Item added to cart successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CartItem' }
              }
            }
          },
          400: { description: 'Validation error or insufficient stock' },
          401: { description: 'Authentication required' },
          404: { description: 'Product not found' }
        }
      }
    },
    '/api/cart/items/{id}': {
      put: {
        summary: 'Update cart item quantity',
        tags: ['Cart'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Cart item ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['quantity'],
                properties: {
                  quantity: { type: 'integer', minimum: 1 }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Cart item updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CartItem' }
              }
            }
          },
          400: { description: 'Validation error or insufficient stock' },
          401: { description: 'Authentication required' },
          404: { description: 'Cart item not found' }
        }
      },
      delete: {
        summary: 'Remove item from cart',
        tags: ['Cart'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Cart item ID'
          }
        ],
        responses: {
          200: { description: 'Item removed from cart successfully' },
          401: { description: 'Authentication required' },
          404: { description: 'Cart item not found' }
        }
      }
    },
    '/api/orders': {
      get: {
        summary: 'Get user orders',
        tags: ['Orders'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
            description: 'Page number for pagination'
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 10 },
            description: 'Number of orders per page'
          }
        ],
        responses: {
          200: {
            description: 'Orders retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    orders: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
                    pagination: { type: 'object' }
                  }
                }
              }
            }
          },
          401: { description: 'Authentication required' }
        }
      },
      post: {
        summary: 'Create new order from cart',
        tags: ['Orders'],
        security: [{ bearerAuth: [] }],
        responses: {
          201: {
            description: 'Order created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Order' }
              }
            }
          },
          400: { description: 'Cart is empty or validation error' },
          401: { description: 'Authentication required' }
        }
      }
    },
    '/api/orders/{id}': {
      get: {
        summary: 'Get order by ID',
        tags: ['Orders'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Order ID'
          }
        ],
        responses: {
          200: {
            description: 'Order retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Order' }
              }
            }
          },
          401: { description: 'Authentication required' },
          404: { description: 'Order not found' }
        }
      }
    },
    '/api/health': {
      get: {
        summary: 'Health check endpoint',
        tags: ['System'],
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                    uptime: { type: 'number' },
                    environment: { type: 'string' },
                    version: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Configure Swagger documentation
 */
const configureSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CommerFlow API Documentation'
  }));
};

module.exports = { configureSwagger, swaggerSpec }; 