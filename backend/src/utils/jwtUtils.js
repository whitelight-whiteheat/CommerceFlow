const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Import centralized configuration
const { ENV_CONFIG } = require('../config/constants');

// JWT configuration
const JWT_CONFIG = {
  expiresIn: ENV_CONFIG.JWT_EXPIRES_IN,
  issuer: ENV_CONFIG.JWT_ISSUER,
  audience: ENV_CONFIG.JWT_AUDIENCE
};

// Get JWT secret from environment variable
const getJwtSecret = () => {
  return ENV_CONFIG.JWT_SECRET;
};

// Remove debug logging in production
if (ENV_CONFIG.NODE_ENV === 'development') {
  console.log('[JWT] Using JWT secret from environment:', ENV_CONFIG.JWT_SECRET ? 'Environment variable' : 'NOT SET');
}

// Generate JWT token
const generateToken = (payload) => {
  try {
    const secret = getJwtSecret();
    return jwt.sign(payload, secret, {
      expiresIn: JWT_CONFIG.expiresIn,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      algorithm: 'HS256'
    });
  } catch (error) {
    console.error('Error generating JWT token:', error);
    throw new Error('Failed to generate authentication token');
  }
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    const secret = getJwtSecret();
      // Remove debug logging in production
  if (ENV_CONFIG.NODE_ENV === 'development') {
    console.log('[JWT] Verifying token with secret:', secret ? 'SET' : 'NOT SET');
    console.log('[JWT] Token to verify:', token.substring(0, 20) + '...');
  }
    
    return jwt.verify(token, secret, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      algorithms: ['HS256']
    });
  } catch (error) {
    console.error('[JWT] Verification failed:', error.name, error.message);
    
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      // Provide more specific error for debugging
      console.error('[JWT] Invalid token details:', {
        error: error.message,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
      });
      throw new Error('Invalid token - please login again');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not active');
    } else {
      console.error('JWT verification error:', error);
      throw new Error('Token verification failed');
    }
  }
};

// Decode JWT token without verification (for debugging)
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    throw new Error('Failed to decode token');
  }
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  try {
    const secret = getJwtSecret();
    const refreshSecret = secret + '_refresh'; // Different secret for refresh tokens
    
    return jwt.sign(
      { userId, type: 'refresh' },
      refreshSecret,
      {
        expiresIn: '7d', // Refresh tokens last longer
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience,
        algorithm: 'HS256'
      }
    );
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const secret = getJwtSecret();
    const refreshSecret = secret + '_refresh';
    
    return jwt.verify(token, refreshSecret, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      algorithms: ['HS256']
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      console.error('Refresh token verification error:', error);
      throw new Error('Refresh token verification failed');
    }
  }
};

// Extract token from Authorization header
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    throw new Error('Authorization header is required');
  }
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Invalid authorization header format');
  }
  
  return parts[1];
};

// Check if token is about to expire (within 1 hour)
const isTokenExpiringSoon = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return false;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const oneHour = 60 * 60;
    
    return (decoded.exp - now) < oneHour;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return false;
  }
};

// Generate secure random string for token blacklisting
const generateTokenId = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  generateRefreshToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  isTokenExpiringSoon,
  generateTokenId,
  JWT_CONFIG
}; 