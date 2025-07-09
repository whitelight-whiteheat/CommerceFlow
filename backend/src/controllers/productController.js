// Product Controller - CommonJS module system (FIXED FOR RAILWAY DEPLOYMENT)
const prisma = require('../config/database');
const { validationResult } = require('express-validator');
const { cacheUtils, queryUtils, monitoringUtils, responseUtils } = require('../utils/performanceUtils');
const Logger = require('../utils/logger');

// Create a new product
const createProduct = async (req, res) => {
    const startTime = Date.now();
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, price, stock, categoryId, images } = req.body;

        // Check if category exists
        const category = await prisma.category.findUnique({
            where: { id: categoryId }
        });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                categoryId,
                images: images || []
            },
        });

        // Clear cache for products list
        cacheUtils.clear();

        responseUtils.addPerformanceHeaders(res, startTime);
        res.status(201).json(product);
    } catch (error) {
        Logger.error('Create product error', error);
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
};

// Get all products with pagination and filtering
const getProducts = async (req, res) => {
    const startTime = Date.now();
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const categoryId = req.query.categoryId;
        const search = req.query.search;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';

        // Create cache key based on query parameters
        const cacheKey = `products:${page}:${limit}:${categoryId}:${search}:${sortBy}:${sortOrder}`;
        
        // Try to get from cache first
        const cachedResult = cacheUtils.get(cacheKey);
        if (cachedResult) {
            responseUtils.addPerformanceHeaders(res, startTime);
            return res.json(cachedResult);
        }

        // Build query with optimization
        let query = {
            include: queryUtils.optimizeIncludes({ category: true }, 'list')
        };

        // Add filtering
        const filters = {};
        if (categoryId) filters.categoryId = categoryId;
        if (search) filters.search = search;
        
        query = queryUtils.addFiltering(query, filters);
        query = queryUtils.addPagination(query, page, limit);
        query = queryUtils.addSorting(query, sortBy, sortOrder);

        console.log('Prisma query:', JSON.stringify(query, null, 2));
        // Execute queries
        const [total, products] = await Promise.all([
            prisma.product.count({ where: query.where }),
            prisma.product.findMany(query)
        ]);

        const result = {
            products: responseUtils.compressResponse(products),
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };

        // Cache the result
        cacheUtils.set(cacheKey, result);

        responseUtils.addPerformanceHeaders(res, startTime);
        res.json(result);
    } catch (error) {
        Logger.error('Get all products error', error);
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

const getProduct = async (req, res) => {
    const startTime = Date.now();
    try {
        const { id } = req.params;

        // Try to get from cache first
        const cacheKey = `product:${id}`;
        const cachedProduct = cacheUtils.get(cacheKey);
        if (cachedProduct) {
            responseUtils.addPerformanceHeaders(res, startTime);
            return res.json(cachedProduct);
        }

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true
            }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Cache the product
        cacheUtils.set(cacheKey, product);

        responseUtils.addPerformanceHeaders(res, startTime);
        res.json(product);
    } catch (error) {
        Logger.error('Get product by ID error', error);
        res.status(500).json({ message: 'Error fetching product' });
    }
};

// Update a product
const updateProduct = async (req, res) => {
    const startTime = Date.now();
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { id } = req.params;
        const { name, description, price, stock, categoryId, images } = req.body;
        
        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
            where: { id }
        });
        
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // If categoryId is provided, check if it exists
        if (categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: categoryId }
            });
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                stock: stock ? parseInt(stock) : undefined,
                categoryId,
                images
            },
            include: {
                category: true
            }
        });

        // Clear related cache
        cacheUtils.clear();

        responseUtils.addPerformanceHeaders(res, startTime);
        res.json(updatedProduct);
    } catch (error) {
        Logger.error('Update product error', error);
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};

// Delete a product
const deleteProduct = async (req, res) => {
    const startTime = Date.now();
    try {
        const { id } = req.params;

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id }
        });
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete product
        await prisma.product.delete({
            where: { id }
        });

        // Clear cache
        cacheUtils.clear();

        responseUtils.addPerformanceHeaders(res, startTime);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        Logger.error('Delete product error', error);
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};

// Get performance metrics
const getPerformanceMetrics = async (req, res) => {
    try {
        const metrics = monitoringUtils.getMetrics();
        res.json(metrics);
    } catch (error) {
        Logger.error('Get performance metrics error', error);
        res.status(500).json({ message: 'Error fetching performance metrics' });
    }
};

// Export the controller functions
module.exports = {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getPerformanceMetrics
};
