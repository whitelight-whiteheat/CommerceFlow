const jwt = require('jsonwebtoken');

// Use environment variable for JWT secret, fallback to portfolio demo secret
const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'portfolio-demo-secret';
};

// Generate test tokens with consistent payload structure
const generateTestToken = (userId, role = 'USER') => {
  const secret = getJwtSecret();
  return jwt.sign(
    { id: userId, role }, // Use 'id' to match the main application
    secret,
    { 
      expiresIn: '1h',
      issuer: 'ecommerce-api',
      audience: 'ecommerce-users',
      algorithm: 'HS256'
    }
  );
};

// Generate admin test token
const generateAdminTestToken = (userId) => {
  return generateTestToken(userId, 'ADMIN');
};

// Generate user test token
const generateUserTestToken = (userId) => {
  return generateTestToken(userId, 'USER');
};

module.exports = {
  generateTestToken,
  generateAdminTestToken,
  generateUserTestToken,
  getJwtSecret
}; 