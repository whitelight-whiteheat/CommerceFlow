console.log('JWT_SECRET at startup:', process.env.JWT_SECRET);
const app = require('./app');

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Use production URL in production, localhost in development
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://resourceful-connection-production.up.railway.app'
    : `http://localhost:${PORT}`;
  
  console.log(`Swagger docs available at ${baseUrl}/api-docs`);
});