/**
 * Configure all application routes
 */
const configureRoutes = (app) => {
  console.log('🔧 Configuring routes...');
  
  try {
    // Import all routes
    console.log('📦 Importing route modules...');
    const userRoutes = require('../routes/userRoutes');
    const productRoutes = require('../routes/productRoutes');
    const categoryRoutes = require('../routes/categoryRoutes');
    const cartRoutes = require('../routes/cartRoutes');
    const orderRoutes = require('../routes/orderRoutes');
    const adminRoutes = require('../routes/adminRoutes');
    const healthRoutes = require('../routes/healthRoutes');
    console.log('✅ All route modules imported successfully');

    // Test route to verify basic routing works
    app.get('/api/test', (req, res) => {
      res.json({ message: 'API routes are working!' });
    });
    console.log('✅ /api/test route registered');

    // Register API routes
    console.log('🔗 Registering API routes...');
    app.use('/api/users', userRoutes);
    console.log('✅ /api/users routes registered');
    app.use('/api/products', productRoutes);
    console.log('✅ /api/products routes registered');
    app.use('/api/categories', categoryRoutes);
    console.log('✅ /api/categories routes registered');
    app.use('/api/cart', cartRoutes);
    console.log('✅ /api/cart routes registered');
    app.use('/api/orders', orderRoutes);
    console.log('✅ /api/orders routes registered');
    app.use('/api/admin', adminRoutes);
    console.log('✅ /api/admin routes registered');

    // Register health check routes
    app.use('/health', healthRoutes);
    console.log('✅ /health routes registered');
    
    console.log('🎉 All routes configured successfully!');
  } catch (error) {
    console.error('❌ Error configuring routes:', error);
    console.error('Error stack:', error.stack);
    // Don't throw error - let app start with basic functionality
    console.log('⚠️  Continuing with basic app functionality...');
  }
};

module.exports = { configureRoutes }; 