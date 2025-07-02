// Environment Configuration Constants
const ENV_CONFIG = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_NAME: process.env.NODE_ENV === 'production' ? 'ecommerce_prod' : 'ecommerce_db',
  DATABASE_USER: process.env.NODE_ENV === 'production' ? 'ecommerce_user' : 'postgres',
  DATABASE_PASSWORD: process.env.NODE_ENV === 'production' ? process.env.POSTGRES_PASSWORD : 'postgres',
  DATABASE_HOST: process.env.NODE_ENV === 'production' ? 'postgres' : 'localhost',
  DATABASE_PORT: 5432,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  JWT_ISSUER: process.env.JWT_ISSUER || 'ecommerce-api',
  JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'ecommerce-users',

  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3001,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Security
  CORS_ORIGIN: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // Admin (should be configurable)
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',

  // Performance
  CACHE_TTL: parseInt(process.env.CACHE_TTL) || 300000,
  ENABLE_METRICS: process.env.ENABLE_METRICS === 'true',
  METRICS_PORT: parseInt(process.env.METRICS_PORT) || 9090,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FORMAT: process.env.LOG_FORMAT || 'combined'
};

// Validation function
const validateEnvironment = () => {
  const required = ['JWT_SECRET', 'DATABASE_URL'];
  const missing = required.filter(key => !ENV_CONFIG[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT_SECRET is the required value
  if (ENV_CONFIG.JWT_SECRET !== 'b40c000ecd38bca4e57e6945e411207843b6945830d81fb4aa24c6f51d11251b') {
    throw new Error('JWT_SECRET must be set to the required value');
  }
};

// Production checks
const isProduction = () => ENV_CONFIG.NODE_ENV === 'production';
const isDevelopment = () => ENV_CONFIG.NODE_ENV === 'development';

// Database URL builder
const buildDatabaseUrl = () => {
  if (ENV_CONFIG.DATABASE_URL) return ENV_CONFIG.DATABASE_URL;
  
  return `postgresql://${ENV_CONFIG.DATABASE_USER}:${ENV_CONFIG.DATABASE_PASSWORD}@${ENV_CONFIG.DATABASE_HOST}:${ENV_CONFIG.DATABASE_PORT}/${ENV_CONFIG.DATABASE_NAME}`;
};

module.exports = {
  ENV_CONFIG,
  validateEnvironment,
  isProduction,
  isDevelopment,
  buildDatabaseUrl
}; 