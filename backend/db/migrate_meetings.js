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

async function migrateMeetings() {
  try {
    console.log('Starting Migration for Meetings Module...');

    // 1. Create meetings table
    console.log('Creating meetings table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        meeting_date DATE NOT NULL,
        meeting_time TIME NOT NULL,
        type VARCHAR(50) NOT NULL,
        link VARCHAR(500),
        location VARCHAR(255),
        agenda TEXT,
        status VARCHAR(50) DEFAULT 'Scheduled',
        mom_url VARCHAR(500),
        created_by INTEGER REFERENCES employees(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create meeting_participants table
    console.log('Creating meeting_participants table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meeting_participants (
        id SERIAL PRIMARY KEY,
        meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(meeting_id, employee_id)
      );
    `);

    // 3. Create meeting_documents table
    console.log('Creating meeting_documents table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meeting_documents (
        id SERIAL PRIMARY KEY,
        meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
        file_url VARCHAR(500) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Meetings Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrateMeetings();
