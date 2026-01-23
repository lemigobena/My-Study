const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes import
const authRoutes = require('./routes/auth.routes');
const noteRoutes = require('./routes/note.routes');
const quizRoutes = require('./routes/quiz.routes');
const uploadRoutes = require('./routes/upload.routes');

// Routes usage
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send('AI Study Assistant Backend Running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
