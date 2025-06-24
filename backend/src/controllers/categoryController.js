const prisma = require('../config/database')

// Get all categories
const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
} catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
}
};

// Create a new category (admin only)
const createCategory = async (req, res) => {
    try {
        const {name} = req.body;
        const category = await prisma.category.create({ data: { name }});
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category'});
    }
    };

    // Update a category (admin only)
    const updateCategory = async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const category = await prisma.category.update({
                where: { id },
                data: { name }
            });
            res.json(category);
        } catch (error) {
            res.status(500).json({ message: 'Error updating category'});
        } 
    };

    // Delete a category (admin only)
    const deleteCategory = async (req, res) => {
        try {
            const {id} = req.params;
            await prisma.category.delete({ where: { id }});
            res.json({ message: 'Category deleted'});
        } catch (error) {
            res.status(500).json({ message: 'Error deleting category'});
        }
    };

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};