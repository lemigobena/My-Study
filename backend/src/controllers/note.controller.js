const prisma = require('../prismaClient');
const axios = require('axios');

const getNotes = async (req, res) => {
    try {
        const notes = await prisma.note.findMany({
            where: { userId: req.user.userId },
            include: { quizzes: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createNote = async (req, res) => {
    const { title, content, subjectId } = req.body;

    try {
        // Call ML Service for summary
        let summary = null;
        let generatedTitle = null;
        try {
            const mlResponse = await axios.post(
                `${process.env.ML_SERVICE_URL}/summarize`,
                { text: content },
                { timeout: 60000 } // 60 second timeout for model processing
            );
            summary = mlResponse.data.summary;
            generatedTitle = mlResponse.data.title;
        } catch (mlError) {
            console.error("ML Service Error:", mlError.message);
            if (mlError.code === 'ECONNREFUSED') {
                summary = "Summary unavailable (ML Service Offline)";
            } else if (mlError.code === 'ECONNABORTED') {
                summary = "Summary unavailable (Request Timed Out)";
            } else {
                summary = "Summary unavailable (ML Error)";
            }
        }

        const note = await prisma.note.create({
            data: {
                title: title || generatedTitle || "Untitled Note",
                content,
                summary,
                userId: req.user.userId,
                subjectId: subjectId ? parseInt(subjectId) : null,
            },
        });
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateNote = async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    try {
        const existingNote = await prisma.note.findUnique({ where: { id: parseInt(id) } });
        if (!existingNote || existingNote.userId !== req.user.userId) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Always re-generate summary on update
        let summary = existingNote.summary;
        try {
            const mlResponse = await axios.post(
                `${process.env.ML_SERVICE_URL}/summarize`,
                { text: content },
                { timeout: 60000 }
            );
            summary = mlResponse.data.summary;
        } catch (mlError) {
            console.error("ML Service Error (Update):", mlError.message);
            // On error, keep the existing summary or set specific error message
            // If we want to show error to user in summary field:
            if (mlError.code === 'ECONNREFUSED') {
                summary = "Summary unavailable (ML Service Offline)";
            } else if (mlError.code === 'ECONNABORTED') {
                summary = "Summary unavailable (Request Timed Out)";
            } else {
                // If ML fails, we might want to keep the OLD summary instead of overwriting it with an error?
                // But user asked for "new summary", so error message is probably better feedback than "nothing happened".
                summary = "Summary unavailable (ML Error)";
            }
        }

        const updatedNote = await prisma.note.update({
            where: { id: parseInt(id) },
            data: { title, content, summary }
        });

        res.json(updatedNote);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getNote = async (req, res) => {
    const { id } = req.params;
    try {
        const note = await prisma.note.findUnique({
            where: { id: parseInt(id) },
        });
        if (!note || note.userId !== req.user.userId) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteNote = async (req, res) => {
    const { id } = req.params;
    try {
        const note = await prisma.note.findUnique({ where: { id: parseInt(id) } });
        if (!note || note.userId !== req.user.userId) {
            return res.status(404).json({ message: 'Note not found' });
        }
        await prisma.note.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Note deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getNotes, createNote, updateNote, getNote, deleteNote };
