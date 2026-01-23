const prisma = require('../prismaClient');
const axios = require('axios');

const generateQuiz = async (req, res) => {
    const { noteId, numQuestions = 5 } = req.body;
    if (!noteId) return res.status(400).json({ message: 'noteId required' });

    try {
        const note = await prisma.note.findUnique({ where: { id: parseInt(noteId) } });
        if (!note || note.userId !== req.user.userId) return res.status(404).json({ message: 'Note not found' });

        let generatedQuestions = [];
        try {
            const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/generate-questions`, {
                text: note.content,
                num_questions: parseInt(numQuestions)
            }, { timeout: 60000 });
            generatedQuestions = mlResponse.data.questions;
        } catch (mlError) {
            console.error("ML unavailable:", mlError);
            // Fallback
            generatedQuestions = [
                { questionText: "ML Service unavailable. Core concept?", options: ["A", "B"], correctAnswer: "A" }
            ];
        }

        // Save Quiz
        const quiz = await prisma.quiz.create({
            data: {
                title: note.title, // Set title to the note title
                userId: req.user.userId,
                noteId: note.id,
                questions: {
                    create: generatedQuestions.map(q => ({
                        questionText: q.questionText,
                        options: q.options,
                        correctAnswer: q.correctAnswer
                    }))
                }
            },
            include: { questions: true }
        });

        res.json(quiz);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getQuizzes = async (req, res) => {
    try {
        const quizzes = await prisma.quiz.findMany({
            where: { userId: req.user.userId },
            include: {
                note: { select: { title: true } },
                questions: { select: { id: true } } // Just to get count
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getQuiz = async (req, res) => {
    const { id } = req.params;
    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: parseInt(id) },
            include: { questions: true }
        });
        if (!quiz || quiz.userId !== req.user.userId) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const submitQuiz = async (req, res) => {
    const { id } = req.params;
    const { score } = req.body;

    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: parseInt(id) }
        });

        if (!quiz || quiz.userId !== req.user.userId) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const updatedQuiz = await prisma.quiz.update({
            where: { id: parseInt(id) },
            data: { score: parseInt(score) }
        });

        res.json(updatedQuiz);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { generateQuiz, getQuizzes, getQuiz, submitQuiz };
