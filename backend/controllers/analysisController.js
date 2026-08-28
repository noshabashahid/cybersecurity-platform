const fs = require('fs');
const path = require('path');
const analysisModel = require('../models/analysisModel');
const aiService = require('../services/aiService');
const urlAnalysisService = require('../services/urlAnalysisService');

function truncate(str, len = 200) {
  if (!str) return '';
  return str.length > len ? `${str.slice(0, len)}…` : str;
}

async function saveAnalysis({ userId, type, inputSummary, result }) {
  const id = await analysisModel.create({
    userId,
    analysisType: type,
    inputSummary: truncate(inputSummary),
    riskScore: result.riskScore,
    riskLevel: result.riskLevel,
    verdict: result.verdict,
    aiMode: result.aiMode || 'fallback',
  });
  await analysisModel.attachResult(id, {
    indicators: result.threats,
    explanation: result.explanation,
    recommendations: result.recommendations,
    rawResult: result,
  });
  return id;
}

async function analyzePhishing(req, res, next) {
  try {
    const { senderEmail, recipientEmail, subject, body, suspiciousUrl } = req.body;
    const result = await aiService.analyzePhishingEmail({ senderEmail, recipientEmail, subject, body, suspiciousUrl });
    const id = await saveAnalysis({
      userId: req.user.id,
      type: 'phishing_email',
      inputSummary: `From: ${senderEmail} | Subject: ${subject}`,
      result,
    });
    res.status(201).json({ success: true, analysisId: id, result });
  } catch (err) {
    next(err);
  }
}

async function analyzeMessage(req, res, next) {
  try {
    const { platform, messageText } = req.body;
    const result = await aiService.analyzeMessage({ platform, messageText });
    const id = await saveAnalysis({
      userId: req.user.id,
      type: 'message',
      inputSummary: `[${platform || 'chat'}] ${messageText}`,
      result,
    });
    res.status(201).json({ success: true, analysisId: id, result });
  } catch (err) {
    next(err);
  }
}

async function analyzeUrl(req, res, next) {
  try {
    const { url } = req.body;
    const scan = await urlAnalysisService.scanUrl(url);
    const result = {
      riskScore: scan.riskScore,
      riskLevel: scan.riskLevel,
      verdict: `${scan.classification}: ${scan.reasons[0] || 'Structural analysis complete.'}`,
      threats: scan.reasons,
      explanation: scan.threatIntelUsed
        ? 'This assessment combines local URL structure analysis with live threat-intelligence lookups.'
        : 'This assessment is based on local URL structure analysis. Configure VIRUSTOTAL_API_KEY / GOOGLE_SAFE_BROWSING_API_KEY for live threat-intel lookups.',
      recommendations: scan.recommendations,
      aiMode: scan.threatIntelUsed ? 'ai' : 'fallback',
      classification: scan.classification,
    };
    const id = await saveAnalysis({ userId: req.user.id, type: 'url', inputSummary: url, result });
    res.status(201).json({ success: true, analysisId: id, result });
  } catch (err) {
    next(err);
  }
}

async function analyzeScreenshot(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file was uploaded.' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
    const imageBase64 = fs.readFileSync(filePath).toString('base64');

    const result = await aiService.analyzeScreenshot({ imageBase64, imageMediaType: req.file.mimetype });

    const id = await saveAnalysis({
      userId: req.user.id,
      type: 'screenshot',
      inputSummary: `Uploaded image: ${req.file.originalname}`,
      result,
    });
    await analysisModel.attachFile(id, {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    });

    res.status(201).json({
      success: true,
      analysisId: id,
      result,
      imageUrl: `/uploads/${req.file.filename}`,
    });
  } catch (err) {
    next(err);
  }
}

async function listHistory(req, res, next) {
  try {
    const { type = '', search = '', page = 1, limit = 15 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const { rows, total } = await analysisModel.listForUser(req.user.id, { type, search, limit, offset });
    res.json({ success: true, data: rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

async function getReport(req, res, next) {
  try {
    const analysis = await analysisModel.findById(req.params.id, req.user.id);
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis report not found.' });
    }
    res.json({ success: true, data: analysis });
  } catch (err) {
    next(err);
  }
}

async function deleteAnalysis(req, res, next) {
  try {
    const ok = await analysisModel.deleteForUser(req.params.id, req.user.id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Analysis not found.' });
    }
    res.json({ success: true, message: 'Analysis deleted.' });
  } catch (err) {
    next(err);
  }
}

async function dashboardStats(req, res, next) {
  try {
    const stats = await analysisModel.statsForUser(req.user.id);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  analyzePhishing,
  analyzeMessage,
  analyzeUrl,
  analyzeScreenshot,
  listHistory,
  getReport,
  deleteAnalysis,
  dashboardStats,
};
