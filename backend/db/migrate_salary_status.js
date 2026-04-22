const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');

const poolConfig = {
  connectionString: process.env.DATABASE_URL
};

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

async function migrate() {
  try {
    console.log('Adding status column to salary_history...');
    await pool.query("ALTER TABLE salary_history ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'paid';");
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
