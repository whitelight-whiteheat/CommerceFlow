import prisma from '../config/database.js';
import { validationResult } from 'express-validator';

// Create a new product
const createProduct = async (req, res) => { // async function to handle the creation of a new product
    try {
        const errors = validationResult(req); // validate the request body
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() }); // if there are validation errors, return a 400 status and the errors
            }

            const { name, description, price, stock, categoryId, images} = req.body; // extract the product data from the request body

            const category = await prisma.category.findUnique({ // check if the category exists in the database using the categoryId from the request body
                where: { id: categoryId}
            });

            if (!category) {
                return res.status(404).json({ message: 'Category not found' }); // if the category does not exist, return a 404 status and a message
            }

            const product = await prisma.product.create({ // create the product in the database using the prisma client
                data: {
                    name,
                    description,
                    price: parseFloat(price),
                    stock: parseInt(stock),
                    categoryId,
                    images: images || []
                },
            });

            res.status(201).json(product); // return the created product in the response body with a 201 status code
    } catch (error) {
        console.error('Create product error:', error); // log the error if it occurs
        res.status(500).json({ message: 'Error creating product', error: error.message }); // return a 500 status and an error message if it occurs
    }
};

// Get all products with pagination and filtering
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // default page 1
        const limit = parseInt(req.query.limit) || 10; // 10 products per page
        const categoryId = req.query.categoryId; // filter by category
        const search = req.query.search; // search by name

        const skip = (page - 1) * limit; // helps the database know where to start when fetching products for the current page.

        // Build where clause
        const where = {}; // initialize an empty object to store the filter criteria
        if (categoryId) {
            where.categoryId = categoryId; // if a categoryId is provided, add it to the filter criteria
        }
        if (search) {
            where.OR = [ // if a search query is provided, add it to the filter criteria
                { description: { contains: search, mode: 'insensitive' } }, // search by description
                { name: { contains: search, mode: 'insensitive' } }, // search by name
            ];
        }

        //Get total count for pagination
        const total = await prisma.product.count({ where });

        //Get products with pagination and filter
        const products = await prisma.product.findMany({ // find all products that match the filter criteria
            where,
            include: {
                category: true, // include the category data in the response
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc' // order the products by the createdAt field in descending order
            }
        });

        //Return response
        res.json({ // return the products and the pagination information in the response body
            products,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit) // calculate the total number of pages based on the total number of products and the limit
            }
        });
    } catch (error) { // handle any errors that occur during the process
        console.error('Get all products error:', error); // log the error if it occurs
        res.status(500).json({ message: 'Error fetching products', error: error.message }); // return a 500 status and an error message if it occurs
    }
};

const getProduct= async (req, res) => { // async function to handle the retrieval of a product by its ID
    try {
        const { id } = req.params; // extract the product ID from the request parameters

        const product = await prisma.product.findUnique({
            where: {id},
            include: {
                category: true
            }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    }   catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({ message: 'Error fetching product'});
    }
};

// Update a product

const updateProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        const {id} = req.params;
        const {name, description, price, stock, categoryId, images} = req.body;
        //Check if product exists
        const existingProduct = await prisma.product.findUnique({
            where: {id}
        });
        if (!existingProduct) {
            return res.status(404).json({message: 'Product not found'})
        }

        //If categoryId is provided, check if it exists
        if (categoryId) {
            const category = await prisma.category.findUnique({
                where: {id: categoryId}
            });
            if (!category) {
                return res.status(404).json({message: 'Category not found'})
            }
        }

        const updatedProduct = await prisma.product.update({
            where: {id},
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

            res.json(updatedProduct);
        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({message: 'Error updating product', error: error.message});
        }
};

//Delete a product
const deleteProduct = async (req, res) => {
    try {
        const {id} = req.params;

        //Check if product exists
        const product = await prisma.product.findUnique({
            where: {id}
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        //Delete product
        await prisma.product.delete({
        where:{id}
    });

    res.json({message: 'Product deleted successfully'});
} catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({message: 'Error deleting product', error: error.message});
}
};

//Export the controller functions
module.exports = {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
};
