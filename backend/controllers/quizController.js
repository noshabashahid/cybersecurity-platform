const quizModel = require('../models/quizModel');
const adminLogModel = require('../models/adminLogModel');

function performanceLevel(pct) {
  if (pct >= 90) return 'Security Expert';
  if (pct >= 70) return 'Security Aware';
  if (pct >= 50) return 'Getting There';
  return 'Needs Improvement';
}

async function getQuiz(req, res, next) {
  try {
    const questions = await quizModel.listQuestions({ includeAnswer: false });
    res.json({ success: true, data: questions });
  } catch (err) {
    next(err);
  }
}

async function submitQuiz(req, res, next) {
  try {
    const { answers } = req.body; // [{ questionId, selected }]
    if (!Array.isArray(answers) || !answers.length) {
      return res.status(400).json({ success: false, message: 'No answers submitted.' });
    }

    let score = 0;
    const detailedResults = [];

    for (const ans of answers) {
      const question = await quizModel.findQuestionById(ans.questionId);
      if (!question) continue;
      const isCorrect = question.correct_option === ans.selected;
      if (isCorrect) score += 1;
      detailedResults.push({
        questionId: question.id,
        question: question.question,
        selected: ans.selected,
        correct: question.correct_option,
        isCorrect,
        explanation: question.explanation,
      });
    }

    const total = detailedResults.length;
    const percentage = total ? Number(((score / total) * 100).toFixed(2)) : 0;
    const level = performanceLevel(percentage);

    const attemptId = await quizModel.recordAttempt({ userId: req.user.id, score, total, percentage, level });
    for (const r of detailedResults) {
      await quizModel.recordAnswer({ attemptId, questionId: r.questionId, selected: r.selected, isCorrect: r.isCorrect });
    }

    res.status(201).json({
      success: true,
      data: { attemptId, score, total, percentage, performanceLevel: level, results: detailedResults },
    });
  } catch (err) {
    next(err);
  }
}

async function myAttempts(req, res, next) {
  try {
    const attempts = await quizModel.attemptsForUser(req.user.id);
    res.json({ success: true, data: attempts });
  } catch (err) {
    next(err);
  }
}

async function createQuestion(req, res, next) {
  try {
    const id = await quizModel.createQuestion(req.body);
    await adminLogModel.log({ adminId: req.user.id, action: 'Created quiz question', targetType: 'quiz_question', targetId: id });
    res.status(201).json({ success: true, message: 'Question created.', id });
  } catch (err) {
    next(err);
  }
}

async function updateQuestion(req, res, next) {
  try {
    await quizModel.updateQuestion(req.params.id, req.body);
    await adminLogModel.log({ adminId: req.user.id, action: 'Updated quiz question', targetType: 'quiz_question', targetId: req.params.id });
    res.json({ success: true, message: 'Question updated.' });
  } catch (err) {
    next(err);
  }
}

async function deleteQuestion(req, res, next) {
  try {
    const ok = await quizModel.deleteQuestion(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Question not found.' });
    await adminLogModel.log({ adminId: req.user.id, action: 'Deleted quiz question', targetType: 'quiz_question', targetId: req.params.id });
    res.json({ success: true, message: 'Question deleted.' });
  } catch (err) {
    next(err);
  }
}

async function adminListQuestions(req, res, next) {
  try {
    const questions = await quizModel.listQuestions({ includeAnswer: true });
    res.json({ success: true, data: questions });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getQuiz,
  submitQuiz,
  myAttempts,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  adminListQuestions,
};
