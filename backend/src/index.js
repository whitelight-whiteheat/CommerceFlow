// Load environment variables (with fallback for dotenv issues)
const { initializeEnvironment } = require('./utils/envLoader');
initializeEnvironment();

// Import centralized configuration
const { ENV_CONFIG, isProduction } = require('./config/constants');
const app = require('./app');

// Start server with error handling
const startServer = () => {
  try {
    const port = ENV_CONFIG.PORT || 3001;
    
    console.log('🚀 Starting CommerFlow Backend...');
    console.log(`📊 Environment: ${ENV_CONFIG.NODE_ENV}`);
    console.log(`🌐 Port: ${port}`);
    console.log(`🔗 CORS Origin: ${ENV_CONFIG.CORS_ORIGIN}`);
    
    const server = app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`🏥 Health check available at: http://localhost:${port}/health`);
      console.log(`📚 API docs available at: http://localhost:${port}/api-docs`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
      }
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();