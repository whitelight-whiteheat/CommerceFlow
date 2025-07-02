// Get JWT secret (hardcoded for MVP simplicity)
const getJwtSecret = () => {
  const secret = 'b40c000ecd38bca4e57e6945e411207843b6945830d81fb4aa24c6f51d11251b';
  console.log('USING HARDCODED JWT SECRET:', secret);
  return secret;
}; 