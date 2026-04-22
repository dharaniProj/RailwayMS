const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');

const poolConfig = {
  connectionString: process.env.DATABASE_URL
};

// Only use SSL if it's a cloud database (like Neon)
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

async function migrate() {
  try {
    console.log('Starting Migration: Salary Fix + Railway Pass Module...');

    // 1. Fix Salary History Table
    console.log('Updating salary_history table structure...');
    
    // Drop the old unique constraint if it exists
    try {
        await pool.query('ALTER TABLE salary_history DROP CONSTRAINT IF EXISTS salary_history_employee_id_month_year_key;');
        await pool.query('ALTER TABLE salary_history DROP CONSTRAINT IF EXISTS salary_history_unique_month;');
    } catch(e) {}

    // Add new columns
    await pool.query('ALTER TABLE salary_history ADD COLUMN IF NOT EXISTS month_year VARCHAR(20);');
    await pool.query('ALTER TABLE salary_history ADD COLUMN IF NOT EXISTS basic_pay NUMERIC(12,2);');
    await pool.query('ALTER TABLE salary_history ADD COLUMN IF NOT EXISTS hra NUMERIC(12,2);');
    await pool.query('ALTER TABLE salary_history ADD COLUMN IF NOT EXISTS allowances NUMERIC(12,2);');
    
    // Create unique constraint
    try {
        await pool.query('ALTER TABLE salary_history ADD CONSTRAINT salary_history_unique_month UNIQUE (employee_id, month_year);');
    } catch(e) {
        console.log('  Note: Unique constraint on month_year already exists or could not be created.');
    }

    // 2. Create Railway Pass Table
    console.log('Creating railway_passes table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS railway_passes (
        id           SERIAL PRIMARY KEY,
        employee_id  INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        full_name    VARCHAR(100) NOT NULL,
        dob          DATE,
        contact_no   VARCHAR(20),
        address      TEXT,
        route_from   VARCHAR(100),
        route_to     VARCHAR(100),
        status       VARCHAR(20) DEFAULT 'Pending',
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
