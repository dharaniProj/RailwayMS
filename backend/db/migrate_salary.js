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
        console.log("Starting Salary DB migration...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS salary_history (
                id SERIAL PRIMARY KEY,
                employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
                month_year VARCHAR(20) NOT NULL,
                basic_pay DECIMAL(12,2) NOT NULL,
                hra DECIMAL(12,2) NOT NULL,
                allowances DECIMAL(12,2) NOT NULL,
                deductions DECIMAL(12,2) NOT NULL,
                net_salary DECIMAL(12,2) NOT NULL,
                status VARCHAR(20) DEFAULT 'paid',
                payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Created salary_history table.");

        console.log("Migration completed successfully.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
};

migrate();
