/**
 * URL Configuration System
 * 
 * Centralized URL management for the CommerFlow platform.
 * All URLs are generated dynamically based on environment configuration.
 */

const { ENV_CONFIG } = require('./constants');

/**
 * URL Configuration Class
 */
class URLConfig {
  constructor() {
    this.baseUrl = this.getBaseUrl();
    this.apiUrl = this.getApiUrl();
    this.frontendUrl = this.getFrontendUrl();
    this.docsUrl = this.getDocsUrl();
    this.healthUrl = this.getHealthUrl();
  }

  /**
   * Get base URL for the backend server
   */
  getBaseUrl() {
    const protocol = ENV_CONFIG.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.HOST || 'localhost';
    const port = ENV_CONFIG.PORT;
    
    // In production, don't include port if it's 80/443
    if (ENV_CONFIG.NODE_ENV === 'production' && (port === 80 || port === 443)) {
      return `${protocol}://${host}`;
    }
    
    return `${protocol}://${host}:${port}`;
  }

  /**
   * Get API base URL
   */
  getApiUrl() {
    return `${this.baseUrl}/api`;
  }

  /**
   * Get frontend URL
   */
  getFrontendUrl() {
    return ENV_CONFIG.FRONTEND_URL || 'http://localhost:3000';
  }

  /**
   * Get API documentation URL
   */
  getDocsUrl() {
    return `${this.baseUrl}/api-docs`;
  }

  /**
   * Get health check URL
   */
  getHealthUrl() {
    return `${this.baseUrl}/health`;
  }

  /**
   * Get admin dashboard URL
   */
  getAdminUrl() {
    return `${this.frontendUrl}/admin`;
  }

  /**
   * Get customer dashboard URL
   */
  getCustomerUrl() {
    return this.frontendUrl;
  }

  /**
   * Get Swagger servers configuration
   */
  getSwaggerServers() {
    return [
      {
        url: this.baseUrl,
        description: ENV_CONFIG.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      }
    ];
  }

  /**
   * Get all URLs for logging/debugging
   */
  getAllUrls() {
    return {
      base: this.baseUrl,
      api: this.apiUrl,
      frontend: this.frontendUrl,
      docs: this.docsUrl,
      health: this.healthUrl,
      admin: this.getAdminUrl(),
      customer: this.getCustomerUrl(),
      environment: ENV_CONFIG.NODE_ENV,
      port: ENV_CONFIG.PORT
    };
  }

  /**
   * Validate URL configuration
   */
  validate() {
    const issues = [];
    
    if (!this.baseUrl) {
      issues.push('Base URL is not configured');
    }
    
    if (!this.frontendUrl) {
      issues.push('Frontend URL is not configured');
    }
    
    if (ENV_CONFIG.NODE_ENV === 'production' && this.baseUrl.includes('localhost')) {
      issues.push('Production environment should not use localhost URLs');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}

// Create singleton instance
const urlConfig = new URLConfig();

module.exports = {
  URLConfig,
  urlConfig
}; 