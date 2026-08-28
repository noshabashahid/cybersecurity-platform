const { pool } = require('../config/db');

const articleModel = {
  async list({ category = '' }) {
    const clauses = [];
    const params = [];
    if (category) {
      clauses.push('category = ?');
      params.push(category);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT * FROM cybersecurity_articles ${where} ORDER BY created_at DESC`,
      params
    );
    return rows.map(parseArticle);
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM cybersecurity_articles WHERE id = ?', [id]);
    return rows[0] ? parseArticle(rows[0]) : null;
  },

  async create(data, createdBy) {
    const [result] = await pool.query(
      `INSERT INTO cybersecurity_articles
        (category, title, description, threat_explanation, warning_signs, prevention_tips, what_to_do, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.category,
        data.title,
        data.description,
        data.threatExplanation,
        JSON.stringify(data.warningSigns || []),
        JSON.stringify(data.preventionTips || []),
        data.whatToDo,
        createdBy,
      ]
    );
    return result.insertId;
  },

  async update(id, data) {
    await pool.query(
      `UPDATE cybersecurity_articles SET
        category = ?, title = ?, description = ?, threat_explanation = ?,
        warning_signs = ?, prevention_tips = ?, what_to_do = ?
       WHERE id = ?`,
      [
        data.category,
        data.title,
        data.description,
        data.threatExplanation,
        JSON.stringify(data.warningSigns || []),
        JSON.stringify(data.preventionTips || []),
        data.whatToDo,
        id,
      ]
    );
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM cybersecurity_articles WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

function parseArticle(row) {
  return {
    ...row,
    warning_signs: safeParse(row.warning_signs, []),
    prevention_tips: safeParse(row.prevention_tips, []),
  };
}

function safeParse(value, fallback) {
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

module.exports = articleModel;
