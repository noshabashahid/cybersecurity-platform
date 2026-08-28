const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

const analysisController = require('../controllers/analysisController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { analysisLimiter } = require('../middleware/rateLimiter');

router.use(authenticate);

router.get('/dashboard-stats', analysisController.dashboardStats);

router.post(
  '/analyze/phishing',
  analysisLimiter,
  [
    body('senderEmail').trim().isEmail().withMessage('A valid sender email is required.'),
    body('subject').trim().notEmpty().withMessage('Subject is required.'),
    body('body').trim().isLength({ min: 5 }).withMessage('Email body is required.'),
    body('recipientEmail').optional({ checkFalsy: true }).isEmail(),
    body('suspiciousUrl').optional({ checkFalsy: true }).isURL().withMessage('Suspicious URL must be a valid URL.'),
  ],
  validate,
  analysisController.analyzePhishing
);

router.post(
  '/analyze/message',
  analysisLimiter,
  [body('messageText').trim().isLength({ min: 3 }).withMessage('Message text is required.')],
  validate,
  analysisController.analyzeMessage
);

router.post(
  '/analyze/url',
  analysisLimiter,
  [body('url').trim().isURL({ require_protocol: true }).withMessage('A valid URL (including http/https) is required.')],
  validate,
  analysisController.analyzeUrl
);

router.post('/analyze/screenshot', analysisLimiter, upload.single('screenshot'), analysisController.analyzeScreenshot);

router.get(
  '/analyses',
  [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 })],
  validate,
  analysisController.listHistory
);
router.get('/analyses/:id', analysisController.getReport);
router.delete('/analyses/:id', analysisController.deleteAnalysis);

module.exports = router;
