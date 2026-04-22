const { Pool } = require('pg');

// Supports two modes:
// 1. Neon / cloud:  set DATABASE_URL in .env (e.g. postgres://user:pass@host/db?sslmode=require)
// 2. Local dev:     set individual DB_* variables in .env

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user:     process.env.DB_USER     || 'postgres',
      host:     process.env.DB_HOST     || 'localhost',
      database: process.env.DB_NAME     || 'railway_management',
      password: process.env.DB_PASSWORD || 'postgres',
      port:     parseInt(process.env.DB_PORT) || 5432,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
