/**
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
  
  console.log('\n🌐 Application URLs:');
  console.log(`   Backend API: ${urls.backend}`);
  console.log(`   Frontend: ${urls.frontend}`);
  console.log(`   Admin Dashboard: ${urls.admin}`);
  console.log(`   Customer Dashboard: ${urls.customer}`);
  console.log(`   API Documentation: ${urls.docs}`);
  console.log(`   Health Check: ${urls.health}`);
}

module.exports = {
  getScriptUrls,
  logUrls,
  urlConfig
};
