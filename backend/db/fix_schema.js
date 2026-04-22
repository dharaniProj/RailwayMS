require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/railway_management',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function run() {
  try {
    console.log('Running schema fixes...');
    
    // Fix employees table
    await pool.query('ALTER TABLE employees ADD COLUMN IF NOT EXISTS leave_count INTEGER DEFAULT 0;');
    await pool.query('ALTER TABLE employees ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT TRUE;');
    console.log('Employees table updated.');

    // Fix leaves table
    await pool.query('ALTER TABLE leaves ADD COLUMN IF NOT EXISTS subject VARCHAR(255);');
    console.log('Leaves table updated.');

    console.log('Schema fixes completed successfully.');
  } catch (err) {
    console.error('Error fixing schema:', err);
  } finally {
    await pool.end();
  }
}

run();
