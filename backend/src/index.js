// Load environment variables (with fallback for dotenv issues)
const { initializeEnvironment } = require('./utils/envLoader');
initializeEnvironment();

// Import centralized configuration
const { ENV_CONFIG, isProduction } = require('./config/constants');
const app = require('./app');

// Start server
app.listen(ENV_CONFIG.PORT, () => {
  console.log(`Server running on port ${ENV_CONFIG.PORT}`);
});