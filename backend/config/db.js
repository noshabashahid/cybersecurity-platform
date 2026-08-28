const mysql = require('mysql2/promise');
require('dotenv').config();

// Central connection pool. Every model/query goes through this pool
// using parameterized placeholders (?) — never raw string concatenation —
// to prevent SQL injection.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cybersecurity_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('[db] MySQL connection pool established.');
  } catch (err) {
    console.error('[db] Failed to connect to MySQL:', err.message);
    console.error('[db] Check DB_HOST/DB_USER/DB_PASSWORD/DB_NAME in your .env file.');
  }
}

module.exports = { pool, testConnection };
