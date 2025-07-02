// Load environment variables from .env file
require('dotenv').config();

// Import centralized configuration
const { ENV_CONFIG, validateEnvironment, isProduction } = require('./config/constants');

// Validate environment
try {
  validateEnvironment();
  console.log('✅ All required environment variables are set');
  console.log('JWT_SECRET at startup:', ENV_CONFIG.JWT_SECRET ? '***SET***' : 'NOT SET');
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}
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