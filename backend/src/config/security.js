/**
 * Security Configuration
 * 
 * Centralized configuration for authentication, authorization, and security policies.
 */

/**
 * Authentication Configuration
 */
export const authConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'demo-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'commerflow',
    audience: process.env.JWT_AUDIENCE || 'commerflow-users',
    algorithm: 'HS256'
  },
  
  // Password Configuration
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    saltRounds: 12,
    maxAttempts: 5,
    lockoutDuration: 900000 // 15 minutes
  },
  
  // Session Configuration
  session: {
    maxSessions: 5,
    sessionTimeout: 3600000, // 1 hour
    refreshThreshold: 300000 // 5 minutes
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // requests per window
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }
};

/**
 * Authorization Configuration
 */
export const authorizationConfig = {
  // Role-based access control
  roles: {
    admin: {
      level: 100,
      permissions: ['*'],
      description: 'Full system access'
    },
    manager: {
      level: 80,
      permissions: [
        'products:read',
        'products:write',
        'orders:read',
        'orders:write',
        'users:read',
        'analytics:read'
      ],
      description: 'Management access'
    },
    staff: {
      level: 60,
      permissions: [
        'products:read',
        'orders:read',
        'orders:write',
        'users:read'
      ],
      description: 'Staff access'
    },
    customer: {
      level: 20,
      permissions: [
        'products:read',
        'orders:read',
        'orders:write',
        'profile:read',
        'profile:write'
      ],
      description: 'Customer access'
    },
    guest: {
      level: 10,
      permissions: [
        'products:read'
      ],
      description: 'Guest access'
    }
  },
  
  // Permission definitions
  permissions: {
    // Product permissions
    'products:read': 'View products',
    'products:write': 'Create/update products',
    'products:delete': 'Delete products',
    
    // Order permissions
    'orders:read': 'View orders',
    'orders:write': 'Create/update orders',
    'orders:delete': 'Delete orders',
    
    // User permissions
    'users:read': 'View users',
    'users:write': 'Create/update users',
    'users:delete': 'Delete users',
    
    // Analytics permissions
    'analytics:read': 'View analytics',
    'analytics:write': 'Create analytics',
    
    // Profile permissions
    'profile:read': 'View own profile',
    'profile:write': 'Update own profile',
    
    // System permissions
    'system:admin': 'System administration',
    'system:config': 'System configuration'
  }
};

/**
 * Security Headers Configuration
 */
export const securityHeadersConfig = {
  // Content Security Policy
  contentSecurityPolicy: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'https:'],
    'connect-src': ["'self'", 'https:'],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  },
  
  // Other security headers
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
};

/**
 * Input Validation Configuration
 */
export const validationConfig = {
  // Common validation rules
  rules: {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email format'
    },
    password: {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message: 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character'
    },
    phone: {
      pattern: /^\+?[\d\s\-\(\)]{10,}$/,
      message: 'Invalid phone number format'
    },
    url: {
      pattern: /^https?:\/\/.+/,
      message: 'Invalid URL format'
    }
  },
  
  // Sanitization rules
  sanitization: {
    html: {
      allowedTags: ['b', 'i', 'em', 'strong', 'a'],
      allowedAttributes: {
        'a': ['href']
      }
    },
    sql: {
      escapeQuotes: true,
      escapeSlashes: true
    }
  }
};

/**
 * CORS Configuration
 */
export const corsConfig = {
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://commerflow.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
};

/**
 * Encryption Configuration
 */
export const encryptionConfig = {
  // Data encryption
  data: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    saltLength: 64
  },
  
  // File encryption
  file: {
    algorithm: 'aes-256-cbc',
    keyLength: 32,
    ivLength: 16
  },
  
  // API key encryption
  apiKey: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16
  }
};

/**
 * Audit Configuration
 */
export const auditConfig = {
  // Audit events to track
  events: {
    authentication: {
      login: true,
      logout: true,
      failed_login: true,
      password_change: true,
      password_reset: true
    },
    authorization: {
      permission_check: true,
      role_change: true,
      access_denied: true
    },
    data: {
      create: true,
      read: true,
      update: true,
      delete: true,
      export: true,
      import: true
    },
    system: {
      configuration_change: true,
      backup: true,
      restore: true,
      maintenance: true
    }
  },
  
  // Audit log retention
  retention: {
    days: 365,
    maxSize: '1GB',
    compress: true
  },
  
  // Audit log format
  format: {
    timestamp: true,
    user: true,
    action: true,
    resource: true,
    details: true,
    ip: true,
    userAgent: true
  }
};

/**
 * Security Utilities
 */
export const securityUtils = {
  /**
   * Generate secure random string
   */
  generateSecureString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  /**
   * Validate password strength
   */
  validatePassword(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[@$!%*?&]/.test(password);
    
    const errors = [];
    
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUppercase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowercase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChars) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      score: this.calculatePasswordScore(password)
    };
  },
  
  /**
   * Calculate password strength score
   */
  calculatePasswordScore(password) {
    let score = 0;
    
    // Length
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[@$!%*?&]/.test(password)) score += 1;
    
    // Bonus for mixed case and numbers
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password) && /[a-zA-Z]/.test(password)) score += 1;
    
    return Math.min(score, 10);
  },
  
  /**
   * Sanitize input
   */
  sanitizeInput(input, type = 'text') {
    if (typeof input !== 'string') return input;
    
    switch (type) {
      case 'html':
        return input
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      
      case 'sql':
        return input
          .replace(/'/g, "''")
          .replace(/\\/g, '\\\\');
      
      case 'url':
        return encodeURIComponent(input);
      
      default:
        return input.trim();
    }
  },
  
  /**
   * Validate email format
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  /**
   * Check if user has permission
   */
  hasPermission(userRole, requiredPermission) {
    const roleConfig = authorizationConfig.roles[userRole];
    if (!roleConfig) return false;
    
    return roleConfig.permissions.includes('*') || 
           roleConfig.permissions.includes(requiredPermission);
  },
  
  /**
   * Check if user has role level
   */
  hasRoleLevel(userRole, requiredLevel) {
    const roleConfig = authorizationConfig.roles[userRole];
    if (!roleConfig) return false;
    
    return roleConfig.level >= requiredLevel;
  }
};

/**
 * Security Policies
 */
export const securityPolicies = {
  // Password policy
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    preventUsernameInPassword: true,
    maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
  },
  
  // Session policy
  sessionPolicy: {
    maxSessions: 5,
    sessionTimeout: 60 * 60 * 1000, // 1 hour
    refreshThreshold: 5 * 60 * 1000, // 5 minutes
    forceLogoutOnPasswordChange: true,
    forceLogoutOnRoleChange: true
  },
  
  // Access policy
  accessPolicy: {
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    requireMFA: false,
    requireEmailVerification: true,
    requirePhoneVerification: false
  },
  
  // Data policy
  dataPolicy: {
    encryptionAtRest: true,
    encryptionInTransit: true,
    dataRetention: {
      userData: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
      auditLogs: 365 * 24 * 60 * 60 * 1000, // 1 year
      temporaryData: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    dataBackup: {
      frequency: 'daily',
      retention: 30 // days
    }
  }
};

/**
 * Default security configuration
 */
export const defaultSecurityConfig = {
  auth: authConfig,
  authorization: authorizationConfig,
  securityHeaders: securityHeadersConfig,
  validation: validationConfig,
  cors: corsConfig,
  encryption: encryptionConfig,
  audit: auditConfig,
  policies: securityPolicies
};

export default {
  authConfig,
  authorizationConfig,
  securityHeadersConfig,
  validationConfig,
  corsConfig,
  encryptionConfig,
  auditConfig,
  securityUtils,
  securityPolicies,
  defaultSecurityConfig
}; 