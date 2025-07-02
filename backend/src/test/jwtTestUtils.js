const jwt = require('jsonwebtoken');

// Use the same JWT secret as the main application
const getJwtSecret = () => {
  return 'b40c000ecd38bca4e57e6945e411207843b6945830d81fb4aa24c6f51d11251b';
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