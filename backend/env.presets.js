/**
 * Environment Configuration Presets
 * 
 * This file contains preset configurations for different deployment scenarios.
 * Use these presets to quickly configure the application for different environments.
 */

const fs = require('fs');
const path = require('path');

// Development preset
const developmentPreset = {
  NODE_ENV: 'development',
  PORT: 3001,
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/commerceflow',
  JWT_SECRET: 'portfolio-demo-secret',
  JWT_EXPIRES_IN: '24h',
  JWT_ISSUER: 'commerflow-api',
  JWT_AUDIENCE: 'commerflow-users',
  FRONTEND_URL: 'http://localhost:3000',
  CORS_ORIGIN: '*',
  RATE_LIMIT_WINDOW_MS: 900000,
  RATE_LIMIT_MAX_REQUESTS: 1000,
  ADMIN_EMAIL: 'admin@example.com',
  ADMIN_PASSWORD: 'admin123',
  CACHE_TTL: 300000,
  MAX_FILE_SIZE: 10485760,
  UPLOAD_PATH: '/uploads',
  LOG_LEVEL: 'info',
  LOG_FORMAT: 'combined',
  ENABLE_METRICS: true,
  METRICS_PORT: 9090
};

// Production preset
const productionPreset = {
  NODE_ENV: 'production',
  PORT: 3001,
  DATABASE_URL: 'postgresql://ecommerce_user:${POSTGRES_PASSWORD}@postgres:5432/ecommerce_prod',
  JWT_SECRET: 'portfolio-demo-secret',
  JWT_EXPIRES_IN: '24h',
  JWT_ISSUER: 'commerflow-api',
  JWT_AUDIENCE: 'commerflow-users',
  FRONTEND_URL: '${FRONTEND_URL}',
  CORS_ORIGIN: '*',
  RATE_LIMIT_WINDOW_MS: 900000,
  RATE_LIMIT_MAX_REQUESTS: 1000,
  ADMIN_EMAIL: 'admin@example.com',
  ADMIN_PASSWORD: 'admin123',
  CACHE_TTL: 300000,
  MAX_FILE_SIZE: 10485760,
  UPLOAD_PATH: '/uploads',
  LOG_LEVEL: 'info',
  LOG_FORMAT: 'combined',
  ENABLE_METRICS: true,
  METRICS_PORT: 9090,
  REDIS_URL: 'redis://:${REDIS_PASSWORD}@redis:6379'
};

// Railway preset
const railwayPreset = {
  NODE_ENV: 'production',
  PORT: 3001,
  DATABASE_URL: 'postgresql://postgres:${PASSWORD}@${HOST}:${PORT}/${DATABASE}',
  JWT_SECRET: 'portfolio-demo-secret',
  JWT_EXPIRES_IN: '24h',
  JWT_ISSUER: 'commerflow-api',
  JWT_AUDIENCE: 'commerflow-users',
  FRONTEND_URL: '${FRONTEND_URL}',
  CORS_ORIGIN: '*',
  RATE_LIMIT_WINDOW_MS: 900000,
  RATE_LIMIT_MAX_REQUESTS: 1000,
  ADMIN_EMAIL: 'admin@example.com',
  ADMIN_PASSWORD: 'admin123',
  CACHE_TTL: 300000,
  MAX_FILE_SIZE: 10485760,
  UPLOAD_PATH: '/uploads',
  LOG_LEVEL: 'info',
  LOG_FORMAT: 'combined',
  ENABLE_METRICS: true,
  METRICS_PORT: 9090
};

/**
 * Generate environment file from preset
 */
function generateEnvFile(preset, outputPath = '.env') {
  const envContent = Object.entries(preset)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(outputPath, envContent);
  console.log(`✅ Generated ${outputPath} from preset`);
}

/**
 * Generate environment file with comments
 */
function generateEnvFileWithComments(preset, outputPath = '.env') {
  const sections = {
    'DATABASE CONFIGURATION': ['DATABASE_URL'],
    'JWT AUTHENTICATION': ['JWT_SECRET', 'JWT_EXPIRES_IN', 'JWT_ISSUER', 'JWT_AUDIENCE'],
    'SERVER CONFIGURATION': ['NODE_ENV', 'PORT', 'FRONTEND_URL'],
    'SECURITY CONFIGURATION': ['CORS_ORIGIN', 'RATE_LIMIT_WINDOW_MS', 'RATE_LIMIT_MAX_REQUESTS'],
    'ADMIN CONFIGURATION': ['ADMIN_EMAIL', 'ADMIN_PASSWORD'],
    'PERFORMANCE & CACHING': ['CACHE_TTL', 'MAX_FILE_SIZE', 'UPLOAD_PATH'],
    'LOGGING CONFIGURATION': ['LOG_LEVEL', 'LOG_FORMAT'],
    'MONITORING & METRICS': ['ENABLE_METRICS', 'METRICS_PORT'],
    'REDIS CACHING': ['REDIS_URL']
  };

  let envContent = '# =============================================================================\n';
  envContent += '# CommerFlow Environment Configuration\n';
  envContent += '# =============================================================================\n\n';

  Object.entries(sections).forEach(([sectionName, keys]) => {
    envContent += `# =============================================================================\n`;
    envContent += `# ${sectionName}\n`;
    envContent += `# =============================================================================\n`;
    
    keys.forEach(key => {
      if (preset[key] !== undefined) {
        envContent += `${key}=${preset[key]}\n`;
      }
    });
    
    envContent += '\n';
  });

  fs.writeFileSync(outputPath, envContent);
  console.log(`✅ Generated ${outputPath} with comments from preset`);
}

// Export presets and functions
module.exports = {
  developmentPreset,
  productionPreset,
  railwayPreset,
  generateEnvFile,
  generateEnvFileWithComments
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const presetName = args[0];
  const outputPath = args[1] || '.env';
  const withComments = args.includes('--comments');

  const presets = {
    dev: developmentPreset,
    development: developmentPreset,
    prod: productionPreset,
    production: productionPreset,
    railway: railwayPreset
  };

  if (!presetName || !presets[presetName]) {
    console.log('Usage: node env.presets.js <preset> [output-path] [--comments]');
    console.log('Available presets: dev, development, prod, production, railway');
    console.log('Example: node env.presets.js dev .env --comments');
    process.exit(1);
  }

  const preset = presets[presetName];
  
  if (withComments) {
    generateEnvFileWithComments(preset, outputPath);
  } else {
    generateEnvFile(preset, outputPath);
  }
} 