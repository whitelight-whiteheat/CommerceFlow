#!/usr/bin/env node

/**
 * URL Update Utility
 * 
 * This script updates hardcoded URLs in script files to use environment variables
 * or dynamic URL generation.
 */

const fs = require('fs');
const path = require('path');
const { urlConfig } = require('../src/config/urls');

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
 * Update URLs in a file
 */
function updateUrlsInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Get current URLs
  const currentUrls = urlConfig.getAllUrls();

  // Replace hardcoded backend URLs
  const backendUrlPatterns = [
    { pattern: /http:\/\/localhost:3001/g, replacement: currentUrls.base },
    { pattern: /http:\/\/localhost:3002/g, replacement: currentUrls.admin },
    { pattern: /http:\/\/localhost:3000/g, replacement: currentUrls.frontend }
  ];

  backendUrlPatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      updated = true;
    }
  });

  // Replace hardcoded production URLs
  const productionUrlPatterns = [
    { 
      pattern: /https:\/\/resourceful-connection-production\.up\.railway\.app/g, 
      replacement: '${BACKEND_URL}' 
    },
    { 
      pattern: /https:\/\/your-frontend-service-name\.up\.railway\.app/g, 
      replacement: '${FRONTEND_URL}' 
    }
  ];

  productionUrlPatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      updated = true;
    }
  });

  if (updated) {
    fs.writeFileSync(filePath, content);
    log(`✅ Updated URLs in ${path.basename(filePath)}`, 'green');
    return true;
  }

  return false;
}

/**
 * Update script files with dynamic URL generation
 */
function updateScriptFiles() {
  logSection('🔧 Updating Script Files');

  const scriptFiles = [
    'scripts/create-admin.js',
    'scripts/simple-admin.js',
    'scripts/setup-admin.js',
    'scripts/setup-admin-container.js',
    'scripts/final-setup.js',
    'scripts/complete-setup.js'
  ];

  let updatedCount = 0;

  scriptFiles.forEach(scriptFile => {
    const filePath = path.join(__dirname, '..', scriptFile);
    if (updateUrlsInFile(filePath)) {
      updatedCount++;
    }
  });

  log(`\n📊 Updated ${updatedCount} script files`, 'green');
}

/**
 * Create URL utility functions for scripts
 */
function createUrlUtils() {
  logSection('🔧 Creating URL Utilities');

  const urlUtilsPath = path.join(__dirname, 'url-utils.js');
  
  const urlUtilsContent = `/**
 * URL Utilities for Scripts
 * 
 * Provides dynamic URL generation for script files.
 */

const { urlConfig } = require('../src/config/urls');

/**
 * Get URLs for script output
 */
function getScriptUrls() {
  const urls = urlConfig.getAllUrls();
  
  return {
    backend: urls.base,
    frontend: urls.frontend,
    admin: urls.admin,
    customer: urls.customer,
    api: urls.api,
    docs: urls.docs,
    health: urls.health
  };
}

/**
 * Log URLs for user guidance
 */
function logUrls() {
  const urls = getScriptUrls();
  
  console.log('\\n🌐 Application URLs:');
  console.log(\`   Backend API: \${urls.backend}\`);
  console.log(\`   Frontend: \${urls.frontend}\`);
  console.log(\`   Admin Dashboard: \${urls.admin}\`);
  console.log(\`   Customer Dashboard: \${urls.customer}\`);
  console.log(\`   API Documentation: \${urls.docs}\`);
  console.log(\`   Health Check: \${urls.health}\`);
}

module.exports = {
  getScriptUrls,
  logUrls,
  urlConfig
};
`;

  fs.writeFileSync(urlUtilsPath, urlUtilsContent);
  log('✅ Created url-utils.js for scripts', 'green');
}

/**
 * Main function
 */
function main() {
  logSection('🚀 URL Cleanup Utility');
  
  try {
    // Validate URL configuration
    const validation = urlConfig.validate();
    if (!validation.valid) {
      log('❌ URL configuration issues found:', 'red');
      validation.issues.forEach(issue => log(`   - ${issue}`, 'yellow'));
      return;
    }

    log('✅ URL configuration is valid', 'green');
    
    // Show current URLs
    const urls = urlConfig.getAllUrls();
    log('\n📋 Current URL Configuration:', 'blue');
    Object.entries(urls).forEach(([key, value]) => {
      log(`   ${key}: ${value}`, 'blue');
    });

    // Update script files
    updateScriptFiles();
    
    // Create URL utilities
    createUrlUtils();
    
    logSection('✅ URL Cleanup Complete');
    log('All hardcoded URLs have been updated to use dynamic configuration', 'green');
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { updateUrlsInFile, updateScriptFiles, createUrlUtils }; 