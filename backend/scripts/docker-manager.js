#!/usr/bin/env node

/**
 * Docker Management Script
 * 
 * Comprehensive Docker operations for CommerFlow development and deployment.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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
 * Execute command with error handling
 */
function execCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8',
      ...options 
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Check if Docker is running
 */
function checkDocker() {
  const result = execCommand('docker --version', { stdio: 'pipe' });
  if (!result.success) {
    log('❌ Docker is not installed or not running', 'red');
    log('Please install Docker Desktop and ensure it\'s running', 'yellow');
    process.exit(1);
  }
  log('✅ Docker is available', 'green');
}

/**
 * Development environment operations
 */
function development() {
  logSection('🚀 Development Environment');
  
  const action = process.argv[3] || 'up';
  
  switch (action) {
    case 'up':
      log('Starting development environment...', 'blue');
      execCommand('docker-compose up -d');
      log('\n📋 Development URLs:', 'green');
      log('   Backend API: http://localhost:3001', 'blue');
      log('   PgAdmin: http://localhost:5050', 'blue');
      log('   Database: localhost:5432', 'blue');
      break;
      
    case 'down':
      log('Stopping development environment...', 'blue');
      execCommand('docker-compose down');
      break;
      
    case 'restart':
      log('Restarting development environment...', 'blue');
      execCommand('docker-compose restart');
      break;
      
    case 'logs':
      log('Showing application logs...', 'blue');
      execCommand('docker-compose logs -f app');
      break;
      
    case 'build':
      log('Building development containers...', 'blue');
      execCommand('docker-compose build --no-cache');
      break;
      
    case 'clean':
      log('Cleaning up development environment...', 'blue');
      execCommand('docker-compose down -v --remove-orphans');
      execCommand('docker system prune -f');
      break;
      
    default:
      log(`❌ Unknown action: ${action}`, 'red');
      log('Available actions: up, down, restart, logs, build, clean', 'yellow');
  }
}

/**
 * Production environment operations
 */
function production() {
  logSection('🏭 Production Environment');
  
  const action = process.argv[3] || 'deploy';
  
  switch (action) {
    case 'deploy':
      log('Deploying production environment...', 'blue');
      
      // Check environment variables
      const requiredEnvVars = ['POSTGRES_PASSWORD', 'FRONTEND_URL', 'REDIS_PASSWORD'];
      const missing = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missing.length > 0) {
        log(`❌ Missing required environment variables: ${missing.join(', ')}`, 'red');
        log('Please set these variables before deploying', 'yellow');
        process.exit(1);
      }
      
      execCommand('docker-compose -f docker-compose.prod.yml up -d');
      log('\n📋 Production URLs:', 'green');
      log('   Backend API: http://localhost:3001', 'blue');
      log('   Frontend: http://localhost:80', 'blue');
      break;
      
    case 'down':
      log('Stopping production environment...', 'blue');
      execCommand('docker-compose -f docker-compose.prod.yml down');
      break;
      
    case 'logs':
      log('Showing production logs...', 'blue');
      execCommand('docker-compose -f docker-compose.prod.yml logs -f');
      break;
      
    case 'build':
      log('Building production containers...', 'blue');
      execCommand('docker-compose -f docker-compose.prod.yml build --no-cache');
      break;
      
    case 'scale':
      const replicas = process.argv[4] || '2';
      log(`Scaling application to ${replicas} replicas...`, 'blue');
      execCommand(`docker-compose -f docker-compose.prod.yml up -d --scale app=${replicas}`);
      break;
      
    default:
      log(`❌ Unknown action: ${action}`, 'red');
      log('Available actions: deploy, down, logs, build, scale', 'yellow');
  }
}

/**
 * Database operations
 */
function database() {
  logSection('🗄️ Database Operations');
  
  const action = process.argv[3] || 'status';
  
  switch (action) {
    case 'status':
      log('Checking database status...', 'blue');
      execCommand('docker-compose exec postgres pg_isready -U postgres');
      break;
      
    case 'backup':
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = `backup-${timestamp}.sql`;
      log(`Creating database backup: ${backupFile}`, 'blue');
      execCommand(`docker-compose exec postgres pg_dump -U postgres commerceflow > ${backupFile}`);
      log(`✅ Backup created: ${backupFile}`, 'green');
      break;
      
    case 'restore':
      const restoreFile = process.argv[4];
      if (!restoreFile) {
        log('❌ Please specify backup file to restore', 'red');
        log('Usage: node scripts/docker-manager.js db restore <backup-file>', 'yellow');
        process.exit(1);
      }
      log(`Restoring database from: ${restoreFile}`, 'blue');
      execCommand(`docker-compose exec -T postgres psql -U postgres commerceflow < ${restoreFile}`);
      break;
      
    case 'reset':
      log('⚠️  This will delete all data!', 'yellow');
      log('Resetting database...', 'blue');
      execCommand('docker-compose down -v');
      execCommand('docker-compose up -d postgres');
      log('✅ Database reset complete', 'green');
      break;
      
    default:
      log(`❌ Unknown action: ${action}`, 'red');
      log('Available actions: status, backup, restore, reset', 'yellow');
  }
}

/**
 * Monitoring and health checks
 */
function monitor() {
  logSection('📊 Monitoring & Health Checks');
  
  const action = process.argv[3] || 'status';
  
  switch (action) {
    case 'status':
      log('Checking service status...', 'blue');
      execCommand('docker-compose ps');
      break;
      
    case 'health':
      log('Running health checks...', 'blue');
      execCommand('docker-compose exec app node -e "require(\'http\').get(\'http://localhost:3001/health\', (res) => { console.log(\'Health check status:\', res.statusCode); process.exit(res.statusCode === 200 ? 0 : 1) })"');
      break;
      
    case 'logs':
      const service = process.argv[4] || 'app';
      log(`Showing logs for ${service}...`, 'blue');
      execCommand(`docker-compose logs -f ${service}`);
      break;
      
    case 'stats':
      log('Container resource usage:', 'blue');
      execCommand('docker stats --no-stream');
      break;
      
    default:
      log(`❌ Unknown action: ${action}`, 'red');
      log('Available actions: status, health, logs, stats', 'yellow');
  }
}

/**
 * Utility operations
 */
function utils() {
  logSection('🔧 Utility Operations');
  
  const action = process.argv[3] || 'help';
  
  switch (action) {
    case 'cleanup':
      log('Cleaning up Docker resources...', 'blue');
      execCommand('docker system prune -f');
      execCommand('docker volume prune -f');
      execCommand('docker network prune -f');
      log('✅ Cleanup complete', 'green');
      break;
      
    case 'images':
      log('Docker images:', 'blue');
      execCommand('docker images');
      break;
      
    case 'volumes':
      log('Docker volumes:', 'blue');
      execCommand('docker volume ls');
      break;
      
    case 'networks':
      log('Docker networks:', 'blue');
      execCommand('docker network ls');
      break;
      
    case 'shell':
      const service = process.argv[4] || 'app';
      log(`Opening shell in ${service} container...`, 'blue');
      execCommand(`docker-compose exec ${service} sh`);
      break;
      
    default:
      log(`❌ Unknown action: ${action}`, 'red');
      log('Available actions: cleanup, images, volumes, networks, shell', 'yellow');
  }
}

/**
 * Show help information
 */
function showHelp() {
  logSection('📖 Docker Manager Help');
  
  console.log(`
Usage: node scripts/docker-manager.js <environment> [action] [options]

Environments:
  dev, development    Development environment operations
  prod, production    Production environment operations
  db, database        Database operations
  monitor             Monitoring and health checks
  utils               Utility operations

Development Actions:
  up                  Start development environment
  down                Stop development environment
  restart             Restart development environment
  logs                Show application logs
  build               Build development containers
  clean               Clean up development environment

Production Actions:
  deploy              Deploy production environment
  down                Stop production environment
  logs                Show production logs
  build               Build production containers
  scale <replicas>    Scale application replicas

Database Actions:
  status              Check database status
  backup              Create database backup
  restore <file>      Restore database from backup
  reset               Reset database (⚠️ destructive)

Monitoring Actions:
  status              Check service status
  health              Run health checks
  logs [service]      Show service logs
  stats               Show resource usage

Utility Actions:
  cleanup             Clean up Docker resources
  images              List Docker images
  volumes             List Docker volumes
  networks            List Docker networks
  shell [service]     Open shell in container

Examples:
  node scripts/docker-manager.js dev up
  node scripts/docker-manager.js prod deploy
  node scripts/docker-manager.js db backup
  node scripts/docker-manager.js monitor health
  node scripts/docker-manager.js utils cleanup
`);
}

/**
 * Main function
 */
function main() {
  checkDocker();
  
  const environment = process.argv[2] || 'help';
  
  switch (environment) {
    case 'dev':
    case 'development':
      development();
      break;
      
    case 'prod':
    case 'production':
      production();
      break;
      
    case 'db':
    case 'database':
      database();
      break;
      
    case 'monitor':
      monitor();
      break;
      
    case 'utils':
      utils();
      break;
      
    case 'help':
    default:
      showHelp();
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  development,
  production,
  database,
  monitor,
  utils
}; 