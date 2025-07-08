// Fallback database configuration (when Prisma client is not available)
const { Pool } = require('pg');

let pool = null;

// Create connection pool
function createPool() {
  if (pool) return pool;
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured');
  }
  
  pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  return pool;
}

// Test database connection
async function testConnection() {
  try {
    const client = await createPool().connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return { success: true, timestamp: result.rows[0].now };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Simple user operations (fallback)
const userOperations = {
  async findUserByEmail(email) {
    const client = await createPool().connect();
    try {
      const result = await client.query('SELECT * FROM "User" WHERE email = $1', [email]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },
  
  async createUser(userData) {
    const client = await createPool().connect();
    try {
      const { email, password, name } = userData;
      const result = await client.query(
        'INSERT INTO "User" (email, password, name) VALUES ($1, $2, $3) RETURNING *',
        [email, password, name]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },
  
  async countUsers() {
    const client = await createPool().connect();
    try {
      const result = await client.query('SELECT COUNT(*) FROM "User"');
      return parseInt(result.rows[0].count);
    } finally {
      client.release();
    }
  }
};

module.exports = {
  createPool,
  testConnection,
  userOperations
}; 