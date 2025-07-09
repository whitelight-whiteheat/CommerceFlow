#!/usr/bin/env node

/**
 * CommerFlow Environment Setup Script
 * 
 * This script provides a unified way to set up environment configuration
 * for different deployment scenarios (development, production, Railway).
 */

const fs = require('fs');
const path = require('path');
const { 
  developmentPreset, 
  productionPreset, 
  railwayPreset,
  generateEnvFileWithComments 
} = require('../env.presets');

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.bold}${colors.blue}${'='.repeat(50)}`);
  console.log(`${title}`);
  console.log(`${'='.repeat(50)}${colors.reset}`);
}

/**
 * Main setup function
 */
async function setupEnvironment() {
  logSection('🚀 CommerFlow Environment Setup');
  
  const args = process.argv.slice(2);
  const environment = args[0] || 'dev';
  const backendPath = path.join(__dirname, '..');
  const frontendPath = path.join(__dirname, '../../frontend');
  
  // Validate environment
  const validEnvironments = ['dev', 'development', 'prod', 'production', 'railway'];
  if (!validEnvironments.includes(environment)) {
    log(`❌ Invalid environment: ${environment}`, 'red');
    log(`Valid environments: ${validEnvironments.join(', ')}`, 'yellow');
    process.exit(1);
  }

  log(`📋 Setting up ${environment} environment...`, 'blue');

  // Backend environment setup
  logSection('🔧 Backend Environment');
  
  const backendEnvPath = path.join(backendPath, '.env');
  let backendPreset;

  switch (environment) {
    case 'dev':
    case 'development':
      backendPreset = developmentPreset;
      log('🎯 Using development preset', 'green');
      break;
    case 'prod':
    case 'production':
      backendPreset = productionPreset;
      log('🎯 Using production preset', 'green');
      break;
    case 'railway':
      backendPreset = railwayPreset;
      log('🎯 Using Railway preset', 'green');
      break;
  }

  // Generate backend .env file
  if (fs.existsSync(backendEnvPath)) {
    log('⚠️  Backend .env already exists - backing up to .env.backup', 'yellow');
    fs.copyFileSync(backendEnvPath, backendEnvPath + '.backup');
  }

  generateEnvFileWithComments(backendPreset, backendEnvPath);
  log('✅ Backend environment configured', 'green');

  // Frontend environment setup
  logSection('🎨 Frontend Environment');
  
  const frontendEnvPath = path.join(frontendPath, '.env');
  const frontendEnvContent = `# Frontend Environment Configuration
REACT_APP_API_URL=${backendPreset.FRONTEND_URL.replace('http://localhost:3000', `http://localhost:${backendPreset.PORT}`)}
REACT_APP_ENV=${backendPreset.NODE_ENV}
REACT_APP_VERSION=1.0.0
`;

  if (fs.existsSync(frontendEnvPath)) {
    log('⚠️  Frontend .env already exists - backing up to .env.backup', 'yellow');
    fs.copyFileSync(frontendEnvPath, frontendEnvPath + '.backup');
  }

  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  log('✅ Frontend environment configured', 'green');

  // Summary
  logSection('📊 Setup Summary');
  
  log(`✅ Environment: ${environment}`, 'green');
  log(`✅ Backend .env: ${backendEnvPath}`, 'green');
  log(`✅ Frontend .env: ${frontendEnvPath}`, 'green');
  
  console.log('\n📋 Next Steps:');
  log('1. Review and adjust the generated .env files if needed', 'blue');
  log('2. Update DATABASE_URL with your PostgreSQL connection', 'blue');
  log('3. Run: npm run install:all', 'blue');
  log('4. Run: npm run dev', 'blue');
  
  if (environment === 'railway') {
    console.log('\n🚂 Railway Deployment:');
    log('1. Copy the environment variables to your Railway project', 'blue');
    log('2. Update FRONTEND_URL with your Railway frontend service URL', 'blue');
    log('3. Deploy your application', 'blue');
  }
  
  if (environment === 'prod' || environment === 'production') {
    console.log('\n⚠️  Production Security Notes:');
    log('• Change JWT_SECRET to a secure random string', 'yellow');
    log('• Update ADMIN_EMAIL and ADMIN_PASSWORD', 'yellow');
    log('• Set CORS_ORIGIN to your specific domain', 'yellow');
    log('• Configure SSL certificates if using HTTPS', 'yellow');
  }

  console.log('\n🎉 Environment setup complete!');
}

/**
 * Validate environment configuration
 */
function validateEnvironment() {
  logSection('🔍 Environment Validation');
  
  const backendEnvPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(backendEnvPath)) {
    log('❌ Backend .env file not found', 'red');
    log('Run: node scripts/setup-env.js <environment>', 'yellow');
    return false;
  }

  const envContent = fs.readFileSync(backendEnvPath, 'utf8');
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV', 'PORT'];
  const missing = [];

  requiredVars.forEach(varName => {
    if (!envContent.includes(`${varName}=`)) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    log(`❌ Missing required environment variables: ${missing.join(', ')}`, 'red');
    return false;
  }

  log('✅ Environment validation passed', 'green');
  return true;
}

// CLI handling
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'validate') {
    validateEnvironment();
  } else {
    setupEnvironment().catch(error => {
      log(`❌ Setup failed: ${error.message}`, 'red');
      process.exit(1);
    });
  }
}

module.exports = { setupEnvironment, validateEnvironment }; 