const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { once } = require('events');

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Ensure auxiliary tables exist (idempotent)
async function ensurePasswordResetSchema() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_prt_user ON password_reset_tokens(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_prt_token_hash ON password_reset_tokens(token_hash);`);
  } catch (e) {
    console.error('Failed to ensure password reset schema:', e);
  }
}

// Kick off schema check as soon as pool is ready
(async () => {
  try {
    // Wait for at least one connection to succeed
    // Not strictly necessary, but avoids running before pool is usable
    await ensurePasswordResetSchema();
  } catch (e) {
    // Already logged inside
  }
})();

// Create context for GraphQL resolvers
const createContext = ({ req }) => {
  let user = null;
  
  // Extract token from Authorization header
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      user = decoded;
    } catch (error) {
      console.warn('Invalid token:', error.message);
    }
  }

  return {
    db: pool,
    user,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  };
};

module.exports = { createContext, pool };
