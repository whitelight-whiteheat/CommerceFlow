// Manual environment loader (fallback for dotenv issues)
const fs = require('fs');
const path = require('path');

/**
 * Load environment variables from .env file manually
 * This is a fallback when dotenv package has issues
 */
function loadEnvironmentVariables() {
  const envPath = path.join(__dirname, '../../.env');
  
  try {
    if (!fs.existsSync(envPath)) {
      console.warn('⚠️  .env file not found at:', envPath);
      return false;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    let loadedCount = 0;
    
    lines.forEach((line, index) => {
      // Skip empty lines and comments
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return;
      }
      
      // Parse key=value pairs
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex === -1) {
        console.warn(`⚠️  Invalid env line ${index + 1}: ${trimmedLine}`);
        return;
      }
      
      const key = trimmedLine.substring(0, equalIndex).trim();
      const value = trimmedLine.substring(equalIndex + 1).trim();
      
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '');
      
      // Set environment variable if not already set
      if (!process.env[key]) {
        process.env[key] = cleanValue;
        loadedCount++;
      }
    });
    
    console.log(`✅ Loaded ${loadedCount} environment variables from .env file`);
    return true;
    
  } catch (error) {
    console.error('❌ Error loading .env file:', error.message);
    return false;
  }
}

/**
 * Validate that required environment variables are set
 */
function validateRequiredEnvVars() {
  const required = [
    'JWT_SECRET',
    'DATABASE_URL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  return true;
}

/**
 * Initialize environment variables
 */
function initializeEnvironment() {
  console.log('🔧 Initializing environment variables...');
  
  // Try to load with dotenv first
  try {
    require('dotenv').config();
    console.log('✅ dotenv loaded successfully');
  } catch (error) {
    console.warn('⚠️  dotenv failed, using manual loader:', error.message);
    loadEnvironmentVariables();
  }
  
  // Validate required variables
  const isValid = validateRequiredEnvVars();
  
  if (!isValid) {
    console.error('❌ Environment initialization failed');
    process.exit(1);
  }
  
  console.log('✅ Environment initialization complete');
  return true;
}

module.exports = {
  loadEnvironmentVariables,
  validateRequiredEnvVars,
  initializeEnvironment
}; 