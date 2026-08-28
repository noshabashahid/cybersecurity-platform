const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Every route below requires a valid JWT AND role === 'admin'.
// This is enforced server-side, not just hidden in the UI.
router.use(authenticate, requireAdmin);

router.get('/dashboard', adminController.dashboard);

router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUser);
router.put(
  '/users/:id/status',
  [body('status').isIn(['active', 'disabled']).withMessage('Status must be active or disabled.')],
  validate,
  adminController.updateUserStatus
);
router.delete('/users/:id', adminController.deleteUser);

router.get('/analyses', adminController.listAnalyses);
router.get('/analyses/:id', adminController.getAnalysisById);

router.get('/logs', adminController.listLogs);
router.get('/quiz-results', adminController.quizResults);

module.exports = router;
