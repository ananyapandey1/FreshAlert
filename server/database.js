import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Neon and many hosted Postgres services
  }
});

const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        google_tokens TEXT
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS Inventory (
        id SERIAL PRIMARY KEY,
        product_name TEXT,
        expiry_date DATE,
        product_image TEXT,
        status TEXT,
        calendar_id TEXT,
        added_on DATE DEFAULT CURRENT_DATE,
        user_id INTEGER DEFAULT 1
      )
    `);

    // Check if user_id column exists is slightly different in Postgres but IF NOT EXISTS on table creation handled it.
    // In a fresh Postgres DB, we don't need the ALTER TABLE dance.

    const res = await client.query('SELECT COUNT(*) as count FROM Inventory');
    if (parseInt(res.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO Inventory (product_name, expiry_date, product_image, status, calendar_id, added_on)
        VALUES 
        ('Organic Milk', '2026-03-20', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=200', 'Fresh', 'cal-1', CURRENT_DATE),
        ('Sourdough Bread', '2026-03-15', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200', 'Fresh', 'cal-2', CURRENT_DATE)
      `);
    }

    client.release();
    console.log('PostgreSQL Database initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

initializeDatabase();

export default pool;
