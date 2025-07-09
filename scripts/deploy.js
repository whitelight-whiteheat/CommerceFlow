#!/usr/bin/env node

/**
 * CommerFlow Deployment Script
 * 
 * Manages deployments across different environments with comprehensive checks.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

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
  console.log(`\n${colors.bold}${colors.blue}${'='.repeat(60)}`);
  console.log(`${title}`);
  console.log(`${'='.repeat(60)}${colors.reset}`);
}

/**
 * Environment Configuration
 */
const environments = {
  development: {
    name: 'Development',
    url: 'http://localhost:3000',
    database: 'commerflow_dev',
    port: 3000
  },
  staging: {
    name: 'Staging',
    url: process.env.STAGING_URL || 'https://staging.commerflow.com',
    database: 'commerflow_staging',
    port: 3000
  },
  production: {
    name: 'Production',
    url: process.env.PRODUCTION_URL || 'https://commerflow.com',
    database: 'commerflow_prod',
    port: 3000
  }
};

/**
 * Pre-deployment checks
 */
function runPreDeploymentChecks(environment) {
  logSection(`🔍 Pre-Deployment Checks - ${environment.name}`);
  
  try {
    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
      throw new Error('Must run from project root directory');
    }
    
    // Check for uncommitted changes
    log('Checking for uncommitted changes...', 'blue');
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
      log('⚠️  Warning: Uncommitted changes detected', 'yellow');
      log(gitStatus, 'yellow');
    } else {
      log('✅ No uncommitted changes', 'green');
    }
    
    // Check current branch
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    log(`📋 Current branch: ${currentBranch}`, 'blue');
    
    // Check for environment file
    const envFile = path.join('backend', '.env');
    if (!fs.existsSync(envFile)) {
      log('⚠️  Warning: .env file not found', 'yellow');
      log('Creating from template...', 'blue');
      execSync('cd backend && node scripts/setup-env.js', { stdio: 'inherit' });
    } else {
      log('✅ Environment file exists', 'green');
    }
    
    // Check dependencies
    log('Checking dependencies...', 'blue');
    execSync('npm ci', { stdio: 'inherit' });
    execSync('cd frontend && npm ci', { stdio: 'inherit' });
    
    // Run tests
    log('Running tests...', 'blue');
    execSync('cd backend && npm test', { stdio: 'inherit' });
    execSync('cd frontend && npm test -- --watchAll=false', { stdio: 'inherit' });
    
    // Build applications
    log('Building applications...', 'blue');
    execSync('cd backend && npm run build', { stdio: 'inherit' });
    execSync('cd frontend && npm run build', { stdio: 'inherit' });
    
    log('✅ Pre-deployment checks completed', 'green');
    
  } catch (error) {
    log(`❌ Pre-deployment checks failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Database migration
 */
function runDatabaseMigration(environment) {
  logSection(`🗄️ Database Migration - ${environment.name}`);
  
  try {
    log('Running database migrations...', 'blue');
    execSync('cd backend && npx prisma migrate deploy', { stdio: 'inherit' });
    
    log('Generating Prisma client...', 'blue');
    execSync('cd backend && npx prisma generate', { stdio: 'inherit' });
    
    log('✅ Database migration completed', 'green');
    
  } catch (error) {
    log(`❌ Database migration failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Deploy to Railway
 */
function deployToRailway(environment) {
  logSection(`🚀 Railway Deployment - ${environment.name}`);
  
  try {
    const serviceName = environment === 'production' 
      ? process.env.RAILWAY_PRODUCTION_SERVICE 
      : process.env.RAILWAY_STAGING_SERVICE;
    
    if (!serviceName) {
      throw new Error(`Railway service name not configured for ${environment}`);
    }
    
    log(`Deploying to Railway service: ${serviceName}`, 'blue');
    
    // Deploy using Railway CLI
    execSync(`railway up --service ${serviceName}`, { stdio: 'inherit' });
    
    log('✅ Railway deployment completed', 'green');
    
  } catch (error) {
    log(`❌ Railway deployment failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Deploy using Docker
 */
function deployWithDocker(environment) {
  logSection(`🐳 Docker Deployment - ${environment.name}`);
  
  try {
    // Build Docker images
    log('Building Docker images...', 'blue');
    execSync('docker-compose -f docker-compose.prod.yml build', { stdio: 'inherit' });
    
    // Deploy using docker-compose
    log('Deploying with docker-compose...', 'blue');
    execSync('docker-compose -f docker-compose.prod.yml up -d', { stdio: 'inherit' });
    
    log('✅ Docker deployment completed', 'green');
    
  } catch (error) {
    log(`❌ Docker deployment failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Health checks
 */
function runHealthChecks(environment) {
  logSection(`🏥 Health Checks - ${environment.name}`);
  
  try {
    const url = environments[environment].url;
    const maxRetries = 10;
    let retries = 0;
    
    log(`Checking health at: ${url}`, 'blue');
    
    while (retries < maxRetries) {
      try {
        const response = execSync(`curl -f ${url}/health`, { encoding: 'utf8' });
        log('✅ Health check passed', 'green');
        log(`Response: ${response.trim()}`, 'blue');
        return;
      } catch (error) {
        retries++;
        log(`⏳ Health check attempt ${retries}/${maxRetries} failed, retrying...`, 'yellow');
        if (retries < maxRetries) {
          execSync('sleep 10', { stdio: 'inherit' });
        }
      }
    }
    
    throw new Error('Health check failed after maximum retries');
    
  } catch (error) {
    log(`❌ Health checks failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Performance tests
 */
function runPerformanceTests(environment) {
  logSection(`⚡ Performance Tests - ${environment.name}`);
  
  try {
    const url = environments[environment].url;
    
    log('Running performance tests...', 'blue');
    
    // Basic performance test
    const startTime = Date.now();
    execSync(`curl -s ${url}/api/products > /dev/null`, { stdio: 'inherit' });
    const responseTime = Date.now() - startTime;
    
    log(`Response time: ${responseTime}ms`, 'blue');
    
    if (responseTime > 2000) {
      log('⚠️  Warning: Response time is slow', 'yellow');
    } else {
      log('✅ Performance is acceptable', 'green');
    }
    
    // Load test (if artillery is available)
    try {
      execSync('npx artillery quick --count 10 --num 5 ' + url, { stdio: 'inherit' });
      log('✅ Load test completed', 'green');
    } catch (error) {
      log('⚠️  Load test skipped (artillery not available)', 'yellow');
    }
    
  } catch (error) {
    log(`❌ Performance tests failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Rollback deployment
 */
function rollbackDeployment(environment) {
  logSection(`🔄 Rollback - ${environment.name}`);
  
  try {
    log('Rolling back deployment...', 'blue');
    
    if (environment === 'production') {
      // Railway rollback
      execSync('railway rollback', { stdio: 'inherit' });
    } else {
      // Docker rollback
      execSync('docker-compose -f docker-compose.prod.yml down', { stdio: 'inherit' });
      execSync('docker-compose -f docker-compose.prod.yml up -d', { stdio: 'inherit' });
    }
    
    log('✅ Rollback completed', 'green');
    
  } catch (error) {
    log(`❌ Rollback failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Generate deployment report
 */
function generateDeploymentReport(environment, success, error = null) {
  const report = {
    timestamp: new Date().toISOString(),
    environment,
    success,
    error: error?.message || null,
    version: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
    branch: execSync('git branch --show-current', { encoding: 'utf8' }).trim()
  };
  
  const reportPath = path.join(__dirname, `../deployment-report-${environment}-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`📋 Deployment report saved to: ${reportPath}`, 'blue');
  return report;
}

/**
 * Show help information
 */
function showHelp() {
  logSection('📖 Deployment Script Help');
  
  console.log(`
Usage: node scripts/deploy.js <environment> [options]

Environments:
  development    Deploy to development environment
  staging        Deploy to staging environment
  production     Deploy to production environment

Options:
  --skip-checks      Skip pre-deployment checks
  --skip-tests       Skip running tests
  --skip-migration   Skip database migration
  --docker           Use Docker deployment instead of Railway
  --rollback         Rollback to previous deployment
  --health-only      Only run health checks
  --performance      Run performance tests after deployment

Examples:
  node scripts/deploy.js development
  node scripts/deploy.js staging --docker
  node scripts/deploy.js production --skip-checks
  node scripts/deploy.js production --rollback
`);
}

/**
 * Main deployment function
 */
async function deploy(environment, options = {}) {
  const startTime = Date.now();
  
  try {
    logSection(`🚀 Starting Deployment - ${environments[environment].name}`);
    
    // Pre-deployment checks
    if (!options.skipChecks) {
      runPreDeploymentChecks(environment);
    }
    
    // Database migration
    if (!options.skipMigration) {
      runDatabaseMigration(environment);
    }
    
    // Deploy
    if (options.docker) {
      deployWithDocker(environment);
    } else {
      deployToRailway(environment);
    }
    
    // Health checks
    if (!options.healthOnly) {
      runHealthChecks(environment);
    }
    
    // Performance tests
    if (options.performance) {
      runPerformanceTests(environment);
    }
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    log(`✅ Deployment completed successfully in ${duration}s`, 'green');
    
    // Generate report
    generateDeploymentReport(environment, true);
    
  } catch (error) {
    log(`❌ Deployment failed: ${error.message}`, 'red');
    
    // Attempt rollback for production
    if (environment === 'production' && !options.rollback) {
      log('🔄 Attempting rollback...', 'yellow');
      try {
        rollbackDeployment(environment);
        log('✅ Rollback successful', 'green');
      } catch (rollbackError) {
        log(`❌ Rollback failed: ${rollbackError.message}`, 'red');
      }
    }
    
    // Generate failure report
    generateDeploymentReport(environment, false, error);
    
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const environment = args[0];
  const options = {
    skipChecks: args.includes('--skip-checks'),
    skipTests: args.includes('--skip-tests'),
    skipMigration: args.includes('--skip-migration'),
    docker: args.includes('--docker'),
    rollback: args.includes('--rollback'),
    healthOnly: args.includes('--health-only'),
    performance: args.includes('--performance')
  };
  
  return { environment, options };
}

/**
 * Main function
 */
function main() {
  const { environment, options } = parseArgs();
  
  if (!environment || environment === 'help') {
    showHelp();
    return;
  }
  
  if (!environments[environment]) {
    log(`❌ Invalid environment: ${environment}`, 'red');
    showHelp();
    process.exit(1);
  }
  
  if (options.rollback) {
    rollbackDeployment(environment);
    return;
  }
  
  if (options.healthOnly) {
    runHealthChecks(environment);
    return;
  }
  
  deploy(environment, options);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  deploy,
  runPreDeploymentChecks,
  runDatabaseMigration,
  deployToRailway,
  deployWithDocker,
  runHealthChecks,
  runPerformanceTests,
  rollbackDeployment,
  generateDeploymentReport
}; 