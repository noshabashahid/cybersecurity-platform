const { pool } = require('../config/db');

const analysisModel = {
  async create({ userId, analysisType, inputSummary, riskScore, riskLevel, verdict, aiMode }) {
    const [result] = await pool.query(
      `INSERT INTO analyses (user_id, analysis_type, input_summary, risk_score, risk_level, verdict, ai_mode)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, analysisType, inputSummary, riskScore, riskLevel, verdict, aiMode]
    );
    return result.insertId;
  },

  async attachResult(analysisId, { indicators, explanation, recommendations, rawResult }) {
    await pool.query(
      `INSERT INTO analysis_results (analysis_id, indicators, explanation, recommendations, raw_result)
       VALUES (?, ?, ?, ?, ?)`,
      [
        analysisId,
        JSON.stringify(indicators || []),
        explanation || '',
        JSON.stringify(recommendations || []),
        JSON.stringify(rawResult || {}),
      ]
    );
  },

  async attachFile(analysisId, { originalName, storedName, mimeType, sizeBytes }) {
    await pool.query(
      `INSERT INTO uploaded_files (analysis_id, original_name, stored_name, mime_type, size_bytes)
       VALUES (?, ?, ?, ?, ?)`,
      [analysisId, originalName, storedName, mimeType, sizeBytes]
    );
  },

  async findById(id, userId = null) {
    const params = [id];
    let sql = `
      SELECT a.*, r.indicators, r.explanation, r.recommendations, r.raw_result,
             f.original_name, f.stored_name, f.mime_type
      FROM analyses a
      LEFT JOIN analysis_results r ON r.analysis_id = a.id
      LEFT JOIN uploaded_files f ON f.analysis_id = a.id
      WHERE a.id = ?
    `;
    if (userId) {
      sql += ' AND a.user_id = ?';
      params.push(userId);
    }
    const [rows] = await pool.query(sql, params);
    return rows[0] || null;
  },

  async listForUser(userId, { type = '', search = '', limit = 20, offset = 0 }) {
    const clauses = ['a.user_id = ?'];
    const params = [userId];
    if (type) {
      clauses.push('a.analysis_type = ?');
      params.push(type);
    }
    if (search) {
      clauses.push('(a.input_summary LIKE ? OR a.verdict LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    const where = `WHERE ${clauses.join(' AND ')}`;
    const [rows] = await pool.query(
      `SELECT a.id, a.analysis_type, a.input_summary, a.risk_score, a.risk_level, a.verdict, a.ai_mode, a.created_at
       FROM analyses a ${where}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM analyses a ${where}`, params);
    return { rows, total };
  },

  async listAll({ type = '', riskLevel = '', search = '', limit = 50, offset = 0 }) {
    const clauses = [];
    const params = [];
    if (type) {
      clauses.push('a.analysis_type = ?');
      params.push(type);
    }
    if (riskLevel) {
      clauses.push('a.risk_level = ?');
      params.push(riskLevel);
    }
    if (search) {
      clauses.push('(u.email LIKE ? OR a.input_summary LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT a.id, a.analysis_type, a.input_summary, a.risk_score, a.risk_level, a.verdict, a.ai_mode, a.created_at,
              u.id AS user_id, u.name AS user_name, u.email AS user_email
       FROM analyses a
       JOIN users u ON u.id = a.user_id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM analyses a JOIN users u ON u.id = a.user_id ${where}`,
      params
    );
    return { rows, total };
  },

  async deleteForUser(id, userId) {
    const [result] = await pool.query('DELETE FROM analyses WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows > 0;
  },

  async statsForUser(userId) {
    const [[totals]] = await pool.query(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN risk_level IN ('HIGH','CRITICAL') THEN 1 ELSE 0 END) AS threats,
              SUM(CASE WHEN risk_level = 'SAFE' THEN 1 ELSE 0 END) AS safe,
              SUM(CASE WHEN risk_level IN ('LOW','MEDIUM') THEN 1 ELSE 0 END) AS suspicious
       FROM analyses WHERE user_id = ?`,
      [userId]
    );
    const [byDay] = await pool.query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS count
       FROM analyses WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
       GROUP BY DATE(created_at) ORDER BY day ASC`,
      [userId]
    );
    const [byType] = await pool.query(
      `SELECT analysis_type, COUNT(*) AS count FROM analyses WHERE user_id = ? GROUP BY analysis_type`,
      [userId]
    );
    return { totals, byDay, byType };
  },

  async platformStats() {
    const [[totals]] = await pool.query(
      `SELECT COUNT(*) AS total_scans,
              SUM(CASE WHEN analysis_type = 'phishing_email' THEN 1 ELSE 0 END) AS phishing,
              SUM(CASE WHEN analysis_type = 'url' THEN 1 ELSE 0 END) AS urls,
              SUM(CASE WHEN analysis_type = 'screenshot' THEN 1 ELSE 0 END) AS screenshots,
              SUM(CASE WHEN analysis_type = 'message' THEN 1 ELSE 0 END) AS messages,
              SUM(CASE WHEN risk_level IN ('HIGH','CRITICAL') THEN 1 ELSE 0 END) AS threats
       FROM analyses`
    );
    const [dailyScans] = await pool.query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS count
       FROM analyses WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
       GROUP BY DATE(created_at) ORDER BY day ASC`
    );
    const [threatDistribution] = await pool.query(
      `SELECT risk_level, COUNT(*) AS count FROM analyses GROUP BY risk_level`
    );
    return { totals, dailyScans, threatDistribution };
  },
};

module.exports = analysisModel;
