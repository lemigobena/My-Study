const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { generateQuiz, getQuizzes, getQuiz, submitQuiz } = require('../controllers/quiz.controller');

router.use(authenticateToken);

router.post('/generate', generateQuiz);
router.get('/', getQuizzes);
router.get('/:id', getQuiz);
router.put('/:id/submit', submitQuiz);

module.exports = router;
