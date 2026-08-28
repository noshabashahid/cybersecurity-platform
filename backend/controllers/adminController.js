const userModel = require('../models/userModel');
const analysisModel = require('../models/analysisModel');
const adminLogModel = require('../models/adminLogModel');
const quizModel = require('../models/quizModel');

async function dashboard(req, res, next) {
  try {
    const userCounts = await userModel.counts();
    const platform = await analysisModel.platformStats();
    res.json({
      success: true,
      data: {
        users: userCounts,
        scans: platform.totals,
        dailyScans: platform.dailyScans,
        threatDistribution: platform.threatDistribution,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const { search = '', role = '', status = '', page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const { rows, total } = await userModel.list({ search, role, status, limit, offset });
    res.json({ success: true, data: rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be "active" or "disabled".' });
    }
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot change your own account status.' });
    }
    await userModel.setStatus(req.params.id, status);
    await adminLogModel.log({
      adminId: req.user.id,
      action: `Set user status to ${status}`,
      targetType: 'user',
      targetId: req.params.id,
    });
    res.json({ success: true, message: `User ${status === 'active' ? 'activated' : 'disabled'}.` });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }
    await userModel.remove(req.params.id);
    await adminLogModel.log({
      adminId: req.user.id,
      action: 'Deleted user',
      targetType: 'user',
      targetId: req.params.id,
    });
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    next(err);
  }
}

async function listAnalyses(req, res, next) {
  try {
    const { type = '', riskLevel = '', search = '', page = 1, limit = 25 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const { rows, total } = await analysisModel.listAll({ type, riskLevel, search, limit, offset });
    res.json({ success: true, data: rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

async function getAnalysisById(req, res, next) {
  try {
    const analysis = await analysisModel.findById(req.params.id);
    if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found.' });
    res.json({ success: true, data: analysis });
  } catch (err) {
    next(err);
  }
}

async function listLogs(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const logs = await adminLogModel.list({ limit, offset });
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
}

async function quizResults(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const attempts = await quizModel.allAttempts({ limit, offset });
    res.json({ success: true, data: attempts });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  dashboard,
  listUsers,
  getUser,
  updateUserStatus,
  deleteUser,
  listAnalyses,
  getAnalysisById,
  listLogs,
  quizResults,
};
