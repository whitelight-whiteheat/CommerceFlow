// Load environment variables (with fallback for dotenv issues)
const { initializeEnvironment } = require('./utils/envLoader');
initializeEnvironment();

// Import centralized configuration
const { ENV_CONFIG, isProduction } = require('./config/constants');
const app = require('./app');

// Start server
app.listen(ENV_CONFIG.PORT, () => {
  console.log(`Server is running on port ${ENV_CONFIG.PORT}`);
  
  // Use production URL in production, localhost in development
  const baseUrl = isProduction() 
    ? 'https://resourceful-connection-production.up.railway.app'
    : `http://localhost:${ENV_CONFIG.PORT}`;
  
  console.log(`Swagger docs available at ${baseUrl}/api-docs`);
});