const articleModel = require('../models/articleModel');
const adminLogModel = require('../models/adminLogModel');

async function listArticles(req, res, next) {
  try {
    const { category = '' } = req.query;
    const articles = await articleModel.list({ category });
    res.json({ success: true, data: articles });
  } catch (err) {
    next(err);
  }
}

async function getArticle(req, res, next) {
  try {
    const article = await articleModel.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found.' });
    res.json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
}

async function createArticle(req, res, next) {
  try {
    const id = await articleModel.create(req.body, req.user.id);
    await adminLogModel.log({ adminId: req.user.id, action: 'Created article', targetType: 'article', targetId: id });
    const article = await articleModel.findById(id);
    res.status(201).json({ success: true, message: 'Article created.', data: article });
  } catch (err) {
    next(err);
  }
}

async function updateArticle(req, res, next) {
  try {
    const existing = await articleModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Article not found.' });
    await articleModel.update(req.params.id, req.body);
    await adminLogModel.log({ adminId: req.user.id, action: 'Updated article', targetType: 'article', targetId: req.params.id });
    const updated = await articleModel.findById(req.params.id);
    res.json({ success: true, message: 'Article updated.', data: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteArticle(req, res, next) {
  try {
    const ok = await articleModel.remove(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Article not found.' });
    await adminLogModel.log({ adminId: req.user.id, action: 'Deleted article', targetType: 'article', targetId: req.params.id });
    res.json({ success: true, message: 'Article deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listArticles, getArticle, createArticle, updateArticle, deleteArticle };
