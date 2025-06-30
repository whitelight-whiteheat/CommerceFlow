const { PrismaClient } = require('@prisma/client');
const { body } = require('express-validator');
const { verifyToken, extractTokenFromHeader } = require('../utils/jwtUtils');
const { securityUtils } = require('./security');
const { AuthenticationError, AuthorizationError } = require('./errorHandler');

const prisma = new PrismaClient();

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      throw new AuthenticationError('Authentication required');
    }

    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyToken(token);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }
  
  if (req.user.role !== 'ADMIN') {
    return next(new AuthorizationError('Admin access required'));
  }
  
  next();
};

// Middleware to check if user owns the resource
const isOwner = (resourceType) => async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const resource = await prisma[resourceType].findUnique({
      where: { id: req.params.id }
    });

    if (!resource) {
      throw new Error('Resource not found');
    }

    if (resource.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new AuthorizationError('Access denied');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Enhanced validation with security checks
const productValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters')
    .custom((value) => {
      if (securityUtils.hasSqlInjection(value)) {
        throw new Error('Invalid product name');
      }
      return securityUtils.sanitizeInput(value);
    }),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .custom((value) => {
      if (securityUtils.hasSqlInjection(value)) {
        throw new Error('Invalid product description');
      }
      return securityUtils.sanitizeInput(value);
    }),
  body('price')
    .trim()
    .notEmpty()
    .withMessage('Product price is required')
    .isFloat({ min: 0 })
    .withMessage('Product price must be a positive number'),
  body('stock')
    .trim()
    .notEmpty()
    .withMessage('Product stock is required')
    .isInt({ min: 0 })
    .withMessage('Product stock must be a positive integer'),
  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
    .isUUID()
    .withMessage('Invalid category ID'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
];

// User registration validation
const userRegistrationValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .custom((value) => {
      if (securityUtils.hasSqlInjection(value)) {
        throw new Error('Invalid name');
      }
      return securityUtils.sanitizeInput(value);
    }),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .custom((value) => {
      if (!securityUtils.isValidEmail(value)) {
        throw new Error('Invalid email format');
      }
      return value.toLowerCase();
    }),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// User login validation
const userLoginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
];

module.exports = {
  auth,
  isAdmin,
  isOwner,
  productValidation,
  userRegistrationValidation,
  userLoginValidation
};
