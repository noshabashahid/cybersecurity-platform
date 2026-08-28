const { pool } = require('../config/db');

const quizModel = {
  async listQuestions({ includeAnswer = false } = {}) {
    const fields = includeAnswer
      ? '*'
      : 'id, category, question, option_a, option_b, option_c, option_d';
    const [rows] = await pool.query(`SELECT ${fields} FROM quiz_questions ORDER BY id ASC`);
    return rows;
  },

  async findQuestionById(id) {
    const [rows] = await pool.query('SELECT * FROM quiz_questions WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async createQuestion(q) {
    const [result] = await pool.query(
      `INSERT INTO quiz_questions
        (category, question, option_a, option_b, option_c, option_d, correct_option, explanation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [q.category, q.question, q.optionA, q.optionB, q.optionC, q.optionD, q.correctOption, q.explanation || null]
    );
    return result.insertId;
  },

  async updateQuestion(id, q) {
    await pool.query(
      `UPDATE quiz_questions SET
        category = ?, question = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?,
        correct_option = ?, explanation = ?
       WHERE id = ?`,
      [q.category, q.question, q.optionA, q.optionB, q.optionC, q.optionD, q.correctOption, q.explanation || null, id]
    );
  },

  async deleteQuestion(id) {
    const [result] = await pool.query('DELETE FROM quiz_questions WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async recordAttempt({ userId, score, total, percentage, level }) {
    const [result] = await pool.query(
      `INSERT INTO quiz_attempts (user_id, score, total_questions, percentage, performance_level)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, score, total, percentage, level]
    );
    return result.insertId;
  },

  async recordAnswer({ attemptId, questionId, selected, isCorrect }) {
    await pool.query(
      `INSERT INTO quiz_answers (attempt_id, question_id, selected_option, is_correct)
       VALUES (?, ?, ?, ?)`,
      [attemptId, questionId, selected, isCorrect ? 1 : 0]
    );
  },

  async attemptsForUser(userId) {
    const [rows] = await pool.query(
      `SELECT id, score, total_questions, percentage, performance_level, created_at
       FROM quiz_attempts WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  },

  async allAttempts({ limit = 50, offset = 0 } = {}) {
    const [rows] = await pool.query(
      `SELECT qa.id, qa.score, qa.total_questions, qa.percentage, qa.performance_level, qa.created_at,
              u.name AS user_name, u.email AS user_email
       FROM quiz_attempts qa
       JOIN users u ON u.id = qa.user_id
       ORDER BY qa.created_at DESC
       LIMIT ? OFFSET ?`,
      [Number(limit), Number(offset)]
    );
    return rows;
  },
};

module.exports = quizModel;
