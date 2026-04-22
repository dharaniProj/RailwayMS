require('dotenv').config();
const { Pool } = require('pg');

const initialPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

const setupDatabase = async () => {
  try {
    const dbName = process.env.DB_NAME || 'railway_management';
    
    const res = await initialPool.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${dbName}'`);
    if (res.rowCount === 0) {
      console.log(`Creating database ${dbName}...`);
      await initialPool.query(`CREATE DATABASE "${dbName}"`);
      console.log('Database created successfully.');
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
    
    await initialPool.end();

    const pool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: dbName,
        password: process.env.DB_PASSWORD || 'postgres',
        port: process.env.DB_PORT || 5432,
    });

    console.log('Dropping existing tables to apply new schema...');
    await pool.query(`DROP TABLE IF EXISTS work_assignments CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS documents CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS leaves CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS employees CASCADE`);

    console.log('Creating tables...');

    // Employees Table
    await pool.query(`
        CREATE TABLE employees (
            id SERIAL PRIMARY KEY,
            employee_id VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'employee',
            
            -- Basic Info
            phone_number VARCHAR(20),
            date_of_birth DATE,
            gender VARCHAR(20),
            marital_status VARCHAR(20),
            spouse_name VARCHAR(100),
            
            -- Job Info
            department VARCHAR(100),
            designation VARCHAR(100),
            joining_date DATE,
            employment_type VARCHAR(50),
            work_location VARCHAR(100),
            salary DECIMAL(12,2),
            official_assets TEXT,
            
            -- Identification
            aadhaar_number VARCHAR(20),
            pan_number VARCHAR(20),
            health_card_number VARCHAR(50),
            health_card_url TEXT,
            
            -- Profile and Documents
            profile_photo_url TEXT,
            other_documents_urls JSONB,
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Leaves Table
    await pool.query(`
        CREATE TABLE leaves (
            id SERIAL PRIMARY KEY,
            employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            reason TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Documents Table
    await pool.query(`
        CREATE TABLE documents (
            id SERIAL PRIMARY KEY,
            employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
            title VARCHAR(100) NOT NULL,
            file_url TEXT NOT NULL,
            uploaded_by INT REFERENCES employees(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Work Table
    await pool.query(`
        CREATE TABLE work_assignments (
            id SERIAL PRIMARY KEY,
            employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            work_mode VARCHAR(20) DEFAULT 'WFO',
            status VARCHAR(20) DEFAULT 'assigned',
            assigned_by INT REFERENCES employees(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Seed Admin
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
        "INSERT INTO employees (employee_id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)",
        ['ADM001', 'System Admin', 'admin@railway.gov.in', hashedPassword, 'admin']
    );
    console.log('Default Admin created/recreated: adm001 / admin123');

    console.log('Database initialization completed successfully.');
    await pool.end();
  } catch (error) {
    console.error('Error setting up database:', error);
  }
};

setupDatabase();
