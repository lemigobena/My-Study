const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'https://my-study-front.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is allowed or if it's a Vercel preview deployment
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
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
