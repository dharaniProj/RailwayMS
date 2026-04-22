require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'railway_management',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

const migrate = async () => {
    try {
        console.log("Starting DB migration...");

        // 1. Add is_first_login to employees
        try {
            await pool.query('ALTER TABLE employees ADD COLUMN is_first_login BOOLEAN DEFAULT TRUE;');
            console.log("Added is_first_login column to employees.");
            // Set admin is_first_login to FALSE
            await pool.query("UPDATE employees SET is_first_login = FALSE WHERE role = 'admin';");
        } catch (err) {
            if (err.code === '42701') {
                console.log("Column is_first_login already exists, skipping...");
            } else {
                throw err;
            }
        }

        // 2. Create announcements table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS announcements (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                duration_hours INT DEFAULT 24,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP
            );
        `);
        console.log("Created announcements table.");

        // 3. Create announcement_reads table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS announcement_reads (
                announcement_id INT REFERENCES announcements(id) ON DELETE CASCADE,
                employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
                read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (announcement_id, employee_id)
            );
        `);
        console.log("Created announcement_reads table.");

        console.log("Migration completed successfully.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
};

migrate();
