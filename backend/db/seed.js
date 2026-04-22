/**
 * seed.js — Populates the Neon (or local) database with test data.
 * Run: node db/seed.js
 *
 * Creates:
 *   - 1 Admin account (ADM001 / admin123)
 *   - 5 Employee accounts (EMP101–EMP105)
 *   - Salary history (last 3 months) for each employee
 *   - 2 sample announcements
 *   - 1 sample leave request per employee
 */

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : new Pool({
      user:     process.env.DB_USER     || 'postgres',
      host:     process.env.DB_HOST     || 'localhost',
      database: process.env.DB_NAME     || 'railway_management',
      password: process.env.DB_PASSWORD || 'postgres',
      port:     parseInt(process.env.DB_PORT) || 5432,
    });

// ─── Employee data ───────────────────────────────────────────────────────────
const employees = [
  {
    employee_id: 'EMP101',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@railway.gov.in',
    dob: '1985-06-15',
    gender: 'Male',
    marital_status: 'Married',
    spouse_name: 'Anita Kumar',
    phone: '9876543201',
    department: 'Operations',
    designation: 'Senior Station Master',
    joining_date: '2010-03-01',
    employment_type: 'Permanent',
    work_location: 'Mumbai',
    salary: 720000,
    aadhaar: '1234 5678 9001',
    pan: 'ABCPK1234R',
    health_card: 'HC-MUM-1001',
  },
  {
    employee_id: 'EMP102',
    name: 'Priya Menon',
    email: 'priya.menon@railway.gov.in',
    dob: '1992-03-22',
    gender: 'Female',
    marital_status: 'Single',
    spouse_name: null,
    phone: '9876543202',
    department: 'HR',
    designation: 'HR Manager',
    joining_date: '2015-07-15',
    employment_type: 'Permanent',
    work_location: 'Delhi',
    salary: 660000,
    aadhaar: '1234 5678 9002',
    pan: 'ABCPM1234R',
    health_card: 'HC-DEL-1002',
  },
  {
    employee_id: 'EMP103',
    name: 'Santosh Rao',
    email: 'santosh.rao@railway.gov.in',
    dob: '1990-11-08',
    gender: 'Male',
    marital_status: 'Married',
    spouse_name: 'Kavitha Rao',
    phone: '9876543203',
    department: 'Engineering',
    designation: 'Junior Engineer',
    joining_date: '2018-01-10',
    employment_type: 'Permanent',
    work_location: 'Chennai',
    salary: 540000,
    aadhaar: '1234 5678 9003',
    pan: 'ABCSR1234R',
    health_card: 'HC-CHE-1003',
  },
  {
    employee_id: 'EMP104',
    name: 'Deepa Nair',
    email: 'deepa.nair@railway.gov.in',
    dob: '1994-07-30',
    gender: 'Female',
    marital_status: 'Single',
    spouse_name: null,
    phone: '9876543204',
    department: 'Finance',
    designation: 'Accounts Officer',
    joining_date: '2019-04-01',
    employment_type: 'Permanent',
    work_location: 'Hyderabad',
    salary: 600000,
    aadhaar: '1234 5678 9004',
    pan: 'ABCDN1234R',
    health_card: 'HC-HYD-1004',
  },
  {
    employee_id: 'EMP105',
    name: 'Amit Sharma',
    email: 'amit.sharma@railway.gov.in',
    dob: '1988-01-17',
    gender: 'Male',
    marital_status: 'Married',
    spouse_name: 'Neha Sharma',
    phone: '9876543205',
    department: 'Security',
    designation: 'Security Inspector',
    joining_date: '2012-09-20',
    employment_type: 'Permanent',
    work_location: 'Kolkata',
    salary: 480000,
    aadhaar: '1234 5678 9005',
    pan: 'ABCAS1234R',
    health_card: 'HC-KOL-1005',
  },
];

// ─── Salary calculation ──────────────────────────────────────────────────────
function calcSalary(annualCTC) {
  const monthly   = annualCTC / 12;
  const basic     = monthly * 0.40;
  const hra       = monthly * 0.20;
  const da        = monthly * 0.15;
  const ta        = monthly * 0.05;
  const gross     = basic + hra + da + ta;
  const pf        = basic * 0.12;
  const tax       = monthly * 0.05;
  const deductions = pf + tax;
  const net       = gross - deductions;
  return { gross: Math.round(gross), deductions: Math.round(deductions), net: Math.round(net) };
}

// ─── Main seed function ──────────────────────────────────────────────────────
async function seed() {
  console.log('\n=== Railway Management System — Database Seeder ===');
  console.log(process.env.DATABASE_URL ? 'Target: Neon (cloud)' : 'Target: Local PostgreSQL');
  console.log('');

  try {
    // ── 1. Ensure required columns exist (idempotent) ────────────────────────
    console.log('[1/6] Ensuring schema is up to date...');

    await pool.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT TRUE`);
    await pool.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS leave_count INTEGER DEFAULT 0`);

    // Ensure salary_history table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS salary_history (
        id           SERIAL PRIMARY KEY,
        emp_id       INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        month        INTEGER NOT NULL,
        year         INTEGER NOT NULL,
        gross_salary NUMERIC(12,2),
        deductions   NUMERIC(12,2),
        net_salary   NUMERIC(12,2),
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(emp_id, month, year)
      )
    `);

    // Ensure notifications table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id         SERIAL PRIMARY KEY,
        emp_id     INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        message    TEXT NOT NULL,
        type       VARCHAR(50) DEFAULT 'general',
        is_read    BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure transfers table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transfers (
        id                  SERIAL PRIMARY KEY,
        emp_id              INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        current_location    VARCHAR(100),
        requested_location  VARCHAR(100),
        reason              TEXT,
        status              VARCHAR(20) DEFAULT 'pending',
        applied_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure documents table has the right columns
    await pool.query(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS doc_id SERIAL`).catch(() => {});
    await pool.query(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS emp_id INTEGER REFERENCES employees(id)`).catch(() => {});
    await pool.query(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Other'`).catch(() => {});
    await pool.query(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_name TEXT`).catch(() => {});
    await pool.query(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_type VARCHAR(50)`).catch(() => {});
    await pool.query(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size INTEGER`).catch(() => {});
    await pool.query(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS uploaded_by VARCHAR(50)`).catch(() => {});
    await pool.query(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS storage_public_id TEXT`).catch(() => {});
    await pool.query(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`).catch(() => {});

    console.log('   Schema ready.');

    // ── 2. Admin account ─────────────────────────────────────────────────────
    console.log('[2/6] Creating admin account (ADM001)...');
    const adminHash = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO employees (employee_id, name, email, password, role, is_first_login)
      VALUES ($1, $2, $3, $4, 'admin', FALSE)
      ON CONFLICT (employee_id) DO UPDATE
        SET name = EXCLUDED.name, password = EXCLUDED.password, is_first_login = FALSE
    `, ['ADM001', 'System Admin', 'admin@railway.gov.in', adminHash]);
    console.log('   ADM001 → admin123');

    // ── 3. Employee accounts ─────────────────────────────────────────────────
    console.log('[3/6] Creating employee accounts...');
    const insertedIds = {};

    for (const e of employees) {
      const firstName = e.name.split(' ')[0];
      const birthYear = new Date(e.dob).getFullYear();
      const plainPwd  = `${firstName}@${birthYear}`;
      const hash      = await bcrypt.hash(plainPwd, 10);

      const res = await pool.query(`
        INSERT INTO employees (
          employee_id, name, email, password, role,
          phone_number, date_of_birth, gender, marital_status, spouse_name,
          department, designation, joining_date, employment_type, work_location,
          salary, aadhaar_number, pan_number, health_card_number,
          leave_count, is_first_login
        ) VALUES (
          $1,$2,$3,$4,'employee',
          $5,$6,$7,$8,$9,
          $10,$11,$12,$13,$14,
          $15,$16,$17,$18,
          0, FALSE
        )
        ON CONFLICT (employee_id) DO UPDATE
          SET name = EXCLUDED.name,
              password = EXCLUDED.password,
              department = EXCLUDED.department,
              designation = EXCLUDED.designation,
              salary = EXCLUDED.salary,
              work_location = EXCLUDED.work_location,
              is_first_login = FALSE
        RETURNING id
      `, [
        e.employee_id, e.name, e.email, hash,
        e.phone, e.dob, e.gender, e.marital_status, e.spouse_name,
        e.department, e.designation, e.joining_date, e.employment_type, e.work_location,
        e.salary, e.aadhaar, e.pan, e.health_card,
      ]);

      insertedIds[e.employee_id] = res.rows[0].id;
      console.log(`   ${e.employee_id} → ${plainPwd}  (${e.name}, ${e.work_location})`);
    }

    // ── 4. Salary history (last 3 months) ────────────────────────────────────
    console.log('[4/6] Seeding salary history...');
    const now = new Date();
    const months = [-2, -1, 0].map(offset => {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      return { month: d.getMonth() + 1, year: d.getFullYear() };
    });

    for (const e of employees) {
      const empDbId = insertedIds[e.employee_id];
      const { gross, deductions, net } = calcSalary(e.salary);
      for (const { month, year } of months) {
        await pool.query(`
          INSERT INTO salary_history (emp_id, month, year, gross_salary, deductions, net_salary)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (emp_id, month, year) DO NOTHING
        `, [empDbId, month, year, gross, deductions, net]);
      }
    }
    console.log(`   3 months × ${employees.length} employees = ${3 * employees.length} records`);

    // ── 5. Sample announcements ──────────────────────────────────────────────
    console.log('[5/6] Seeding announcements...');
    await pool.query(`
      INSERT INTO announcements (title, message)
      VALUES
        ('Welcome to Railway MS', 'The new Railway Management System is now live. Please log in and update your profile details.'),
        ('Holiday Notice', 'The office will remain closed on 15 August 2026 on account of Independence Day. Happy Independence Day!')
      ON CONFLICT DO NOTHING
    `).catch(async () => {
      // If ON CONFLICT DO NOTHING fails due to no unique constraint, just try inserting
      const count = await pool.query('SELECT COUNT(*) FROM announcements');
      if (parseInt(count.rows[0].count) === 0) {
        await pool.query(`
          INSERT INTO announcements (title, message) VALUES
          ('Welcome to Railway MS', 'The new Railway Management System is now live.'),
          ('Holiday Notice', 'The office will remain closed on 15 August 2026 on account of Independence Day.')
        `);
      }
    });
    console.log('   2 announcements created.');

    // ── 6. Sample leave requests ─────────────────────────────────────────────
    console.log('[6/6] Seeding sample leave requests...');
    const leaveData = [
      { id: insertedIds['EMP101'], subject: 'Medical Leave', reason: 'Scheduled surgery follow-up appointment', start: '2026-05-05', end: '2026-05-07' },
      { id: insertedIds['EMP102'], subject: 'Personal Leave', reason: 'Family function attendance', start: '2026-05-12', end: '2026-05-13' },
      { id: insertedIds['EMP103'], subject: 'Sick Leave', reason: 'Fever and cold', start: '2026-04-28', end: '2026-04-28' },
    ];

    for (const l of leaveData) {
      // Check if leaves table uses 'employee_id' or 'emp_id'
      try {
        await pool.query(`
          INSERT INTO leaves (employee_id, start_date, end_date, reason, status)
          VALUES ($1, $2, $3, $4, 'pending')
        `, [l.id, l.start, l.end, l.reason]);
      } catch {
        try {
          await pool.query(`
            INSERT INTO leaves (emp_id, subject, start_date, end_date, reason, status)
            VALUES ($1, $2, $3, $4, $5, 'pending')
          `, [l.id, l.subject, l.start, l.end, l.reason]);
        } catch (err2) {
          console.log(`   Skipped leave for emp ${l.id}: ${err2.message}`);
        }
      }
    }
    console.log('   3 pending leave requests created.');

    // ── Done ─────────────────────────────────────────────────────────────────
    console.log('\n=== Seed Complete ===\n');
    console.log('Login credentials:');
    console.log('  ADM001          → admin123');
    employees.forEach(e => {
      const pw = `${e.name.split(' ')[0]}@${new Date(e.dob).getFullYear()}`;
      console.log(`  ${e.employee_id.padEnd(15)} → ${pw}`);
    });
    console.log('');

  } catch (err) {
    console.error('\nSeed failed:', err.message);
    console.error(err.stack);
  } finally {
    await pool.end();
  }
}

seed();
