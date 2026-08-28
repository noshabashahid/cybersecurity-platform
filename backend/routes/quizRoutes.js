const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const quizController = require('../controllers/quizController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const questionValidation = [
  body('category').notEmpty().withMessage('Category is required.'),
  body('question').trim().notEmpty().withMessage('Question text is required.'),
  body('optionA').trim().notEmpty(),
  body('optionB').trim().notEmpty(),
  body('optionC').trim().notEmpty(),
  body('optionD').trim().notEmpty(),
  body('correctOption').isIn(['a', 'b', 'c', 'd']).withMessage('correctOption must be a, b, c, or d.'),
];

router.get('/', authenticate, quizController.getQuiz);
router.post(
  '/submit',
  authenticate,
  [body('answers').isArray({ min: 1 }).withMessage('answers must be a non-empty array.')],
  validate,
  quizController.submitQuiz
);
router.get('/my-attempts', authenticate, quizController.myAttempts);

// Admin question management
router.get('/admin/questions', authenticate, requireAdmin, quizController.adminListQuestions);
router.post('/admin/questions', authenticate, requireAdmin, questionValidation, validate, quizController.createQuestion);
router.put('/admin/questions/:id', authenticate, requireAdmin, questionValidation, validate, quizController.updateQuestion);
router.delete('/admin/questions/:id', authenticate, requireAdmin, quizController.deleteQuestion);

module.exports = router;
