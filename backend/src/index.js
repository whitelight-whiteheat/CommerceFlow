console.log('JWT_SECRET at startup:', process.env.JWT_SECRET);
const app = require('./app');

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});