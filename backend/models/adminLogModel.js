const { pool } = require('../config/db');

const adminLogModel = {
  async log({ adminId, action, targetType = null, targetId = null, details = null }) {
    await pool.query(
      `INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
       VALUES (?, ?, ?, ?, ?)`,
      [adminId, action, targetType, targetId, details]
    );
  },

  async list({ limit = 50, offset = 0 } = {}) {
    const [rows] = await pool.query(
      `SELECT al.*, u.name AS admin_name, u.email AS admin_email
       FROM admin_logs al
       JOIN users u ON u.id = al.admin_id
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [Number(limit), Number(offset)]
    );
    return rows;
  },
};

module.exports = adminLogModel;
