require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/railway_management',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function seed() {
  try {
    console.log('Seeding sample leave data...');
    
    // Get all employees (excluding admin)
    const employees = await pool.query('SELECT id, name FROM employees WHERE role = \'employee\'');
    
    if (employees.rows.length === 0) {
      console.log('No employees found to seed leaves for.');
      return;
    }

    const sampleLeaves = [
      { subject: 'Sick Leave', reason: 'Flu and fever', daysAgoStart: 10, daysAgoEnd: 8, status: 'approved' },
      { subject: 'Personal Work', reason: 'Bank related work', daysAgoStart: 20, daysAgoEnd: 19, status: 'approved' },
      { subject: 'Family Event', reason: 'Sisters wedding', daysAgoStart: 30, daysAgoEnd: 25, status: 'approved' },
      { subject: 'Vacation', reason: 'Trip to Shimla', daysAgoStart: 50, daysAgoEnd: 45, status: 'approved' }
    ];

    for (const emp of employees.rows) {
      console.log(`Seeding leaves for ${emp.name}...`);
      
      for (const leave of sampleLeaves) {
        const start = new Date();
        start.setDate(start.getDate() - leave.daysAgoStart);
        const end = new Date();
        end.setDate(end.getDate() - leave.daysAgoEnd);
        
        await pool.query(
          'INSERT INTO leaves (employee_id, subject, reason, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5, $6)',
          [emp.id, leave.subject, leave.reason, start.toISOString().split('T')[0], end.toISOString().split('T')[0], leave.status]
        );
      }
      
      // Update leave count for the employee (deduct 10 days for samples)
      await pool.query('UPDATE employees SET leave_count = 20 WHERE id = $1', [emp.id]);
    }

    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error('Error seeding leaves:', err);
  } finally {
    await pool.end();
  }
}

seed();
