const { pool } = require('../config/db');

const userModel = {
  async create({ name, email, passwordHash, role = 'user' }) {
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, status)
       VALUES (?, ?, ?, ?, 'active')`,
      [name, email, passwordHash, role]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, status, created_at, updated_at, last_login
       FROM users WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async updateLastLogin(id) {
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
  },

  async updatePassword(id, passwordHash) {
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
  },

  async updateProfile(id, { name }) {
    await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, id]);
  },

  async list({ search = '', role = '', status = '', limit = 50, offset = 0 }) {
    const clauses = [];
    const params = [];
    if (search) {
      clauses.push('(name LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role) {
      clauses.push('role = ?');
      params.push(role);
    }
    if (status) {
      clauses.push('status = ?');
      params.push(status);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT id, name, email, role, status, created_at, last_login
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM users ${where}`,
      params
    );
    return { rows, total: countRows[0].total };
  },

  async setStatus(id, status) {
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
  },

  async remove(id) {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
  },

  async counts() {
    const [[total]] = await pool.query('SELECT COUNT(*) AS c FROM users');
    const [[active]] = await pool.query("SELECT COUNT(*) AS c FROM users WHERE status = 'active'");
    const [[disabled]] = await pool.query("SELECT COUNT(*) AS c FROM users WHERE status = 'disabled'");
    return { total: total.c, active: active.c, disabled: disabled.c };
  },
};

module.exports = userModel;
