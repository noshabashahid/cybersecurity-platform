const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const articleController = require('../controllers/articleController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

const articleValidation = [
  body('category').notEmpty().withMessage('Category is required.'),
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters.'),
  body('description').trim().isLength({ min: 3, max: 500 }).withMessage('Description must be 3-500 characters.'),
  body('threatExplanation').trim().notEmpty().withMessage('Threat explanation is required.'),
  body('whatToDo').trim().notEmpty().withMessage('"What to do" is required.'),
  body('warningSigns').isArray({ min: 1 }).withMessage('At least one warning sign is required.'),
  body('preventionTips').isArray({ min: 1 }).withMessage('At least one prevention tip is required.'),
];

// Public read access — awareness content should be readable by anyone logged in.
router.get('/', authenticate, articleController.listArticles);
router.get('/:id', authenticate, articleController.getArticle);

// Admin-only writes.
router.post('/', authenticate, requireAdmin, articleValidation, validate, articleController.createArticle);
router.put('/:id', authenticate, requireAdmin, articleValidation, validate, articleController.updateArticle);
router.delete('/:id', authenticate, requireAdmin, articleController.deleteArticle);

module.exports = router;
