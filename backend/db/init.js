/**
 * init.js — Creates all database tables.
 * Works with Neon (DATABASE_URL) or local PostgreSQL.
 * Safe to re-run: uses CREATE TABLE IF NOT EXISTS.
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

const setupDatabase = async () => {
  try {
    console.log(process.env.DATABASE_URL ? 'Target: Neon (cloud)' : 'Target: Local PostgreSQL');
    console.log('Creating tables...');

    // ── employees ─────────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id                  SERIAL PRIMARY KEY,
        employee_id         VARCHAR(50) UNIQUE NOT NULL,
        name                VARCHAR(100) NOT NULL,
        email               VARCHAR(100) UNIQUE NOT NULL,
        password            VARCHAR(255) NOT NULL,
        role                VARCHAR(20) DEFAULT 'employee',
        phone_number        VARCHAR(20),
        date_of_birth       DATE,
        gender              VARCHAR(20),
        marital_status      VARCHAR(20),
        spouse_name         VARCHAR(100),
        department          VARCHAR(100),
        designation         VARCHAR(100),
        joining_date        DATE,
        employment_type     VARCHAR(50),
        work_location       VARCHAR(100),
        salary              DECIMAL(12,2),
        official_assets     TEXT,
        aadhaar_number      VARCHAR(20),
        pan_number          VARCHAR(20),
        health_card_number  VARCHAR(50),
        health_card_url     TEXT,
        profile_photo_url   TEXT,
        other_documents_urls JSONB,
        leave_count         INTEGER DEFAULT 0,
        is_first_login      BOOLEAN DEFAULT TRUE,
        created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  employees table OK');

    // ── leaves ────────────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leaves (
        id           SERIAL PRIMARY KEY,
        employee_id  INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        subject      VARCHAR(255),
        reason       TEXT NOT NULL,
        start_date   DATE,
        end_date     DATE,
        status       VARCHAR(20) DEFAULT 'pending',
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  leaves table OK');

    // ── transfers ─────────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transfers (
        id                  SERIAL PRIMARY KEY,
        employee_id         INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        from_location       VARCHAR(100),
        to_location         VARCHAR(100),
        reason              TEXT,
        status              VARCHAR(20) DEFAULT 'pending',
        effective_date      DATE,
        created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  transfers table OK');

    // ── documents ─────────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        doc_id            SERIAL PRIMARY KEY,
        employee_id       INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        title             VARCHAR(255) NOT NULL,
        category          VARCHAR(100) DEFAULT 'Other',
        file_url          TEXT NOT NULL,
        file_name         TEXT,
        file_type         VARCHAR(50),
        file_size         INTEGER,
        uploaded_by       VARCHAR(50),
        storage_public_id TEXT,
        uploaded_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  documents table OK');

    // ── salary_history ────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS salary_history (
        id           SERIAL PRIMARY KEY,
        employee_id  INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        month        INTEGER NOT NULL,
        year         INTEGER NOT NULL,
        gross_salary NUMERIC(12,2),
        deductions   NUMERIC(12,2),
        net_salary   NUMERIC(12,2),
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employee_id, month, year)
      )
    `);
    console.log('  salary_history table OK');

    // ── announcements ─────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id             SERIAL PRIMARY KEY,
        title          VARCHAR(255) NOT NULL,
        message        TEXT NOT NULL,
        duration_hours INT DEFAULT 24,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at     TIMESTAMP
      )
    `);
    console.log('  announcements table OK');

    // ── announcement_reads ────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcement_reads (
        announcement_id INT REFERENCES announcements(id) ON DELETE CASCADE,
        employee_id     INT REFERENCES employees(id) ON DELETE CASCADE,
        read_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (announcement_id, employee_id)
      )
    `);
    console.log('  announcement_reads table OK');

    // ── notifications ─────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        title      VARCHAR(255),
        message    TEXT NOT NULL,
        type       VARCHAR(50) DEFAULT 'general',
        is_read    BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  notifications table OK');

    console.log('\nAll tables created successfully.');
    console.log('Now run: node db/seed.js');

  } catch (error) {
    console.error('Error creating tables:', error.message);
  } finally {
    await pool.end();
  }
};

setupDatabase();
