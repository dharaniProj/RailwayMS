require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log('Starting comprehensive migration on Neon DB...');

    // 1. Employees table
    console.log('Updating employees table...');
    await pool.query('ALTER TABLE employees ADD COLUMN IF NOT EXISTS leave_count INTEGER DEFAULT 0;');
    await pool.query('ALTER TABLE employees ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT TRUE;');

    // 2. Leaves table
    console.log('Updating leaves table...');
    try { await pool.query('ALTER TABLE leaves RENAME COLUMN emp_id TO employee_id;'); } catch(e){}
    try { await pool.query('ALTER TABLE leaves RENAME COLUMN applied_at TO created_at;'); } catch(e){}
    await pool.query('ALTER TABLE leaves ADD COLUMN IF NOT EXISTS subject VARCHAR(255);');

    // 3. Transfers table
    console.log('Updating transfers table...');
    try { await pool.query('ALTER TABLE transfers RENAME COLUMN emp_id TO employee_id;'); } catch(e){}
    try { await pool.query('ALTER TABLE transfers RENAME COLUMN applied_at TO created_at;'); } catch(e){}
    try { await pool.query('ALTER TABLE transfers RENAME COLUMN current_location TO from_location;'); } catch(e){}
    try { await pool.query('ALTER TABLE transfers RENAME COLUMN requested_location TO to_location;'); } catch(e){}
    await pool.query('ALTER TABLE transfers ADD COLUMN IF NOT EXISTS effective_date DATE;');

    // 4. Notifications table
    console.log('Updating notifications table...');
    try { await pool.query('ALTER TABLE notifications RENAME COLUMN emp_id TO user_id;'); } catch(e){}
    await pool.query('ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title VARCHAR(255);');

    // 5. Documents table
    console.log('Updating documents table...');
    try { await pool.query('ALTER TABLE documents RENAME COLUMN emp_id TO employee_id;'); } catch(e){}

    // 6. Salary History table
    console.log('Updating salary_history table...');
    try { await pool.query('ALTER TABLE salary_history RENAME COLUMN emp_id TO employee_id;'); } catch(e){}

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
