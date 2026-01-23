# My Study - AI-Powered Study Assistant

An intelligent study platform that helps you summarize notes, generate quizzes, and upload documents for instant analysis using NLP models.

## 🚀 Features
- **AI Summarization**: Get instant summaries and key points from your notes or uploaded documents.
- **Quiz Generation**: Automatically generate interactive quizzes based on your study materials.
- **Document Support**: Upload PDF, Docx, or TXT files for AI processing.
- **Dark Mode**: Premium glassmorphism UI with theme support.

## 🛠️ Architecture
- **Frontend**: React + Vite + Axios
- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **ML Service**: Python + FastAPI + Hugging Face Transformers (DistilBART & T5)

---

## 🚦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL (or Neon.tech)
- Cloudinary Account (for file uploads)

### 2. Service Setup

#### Backend (`/backend`)
1. Create a `.env` file based on `.env.example`.
2. Install dependencies: `npm install`
3. Push database schema: `npx prisma db push`
4. Start server: `npm run dev`

#### Frontend (`/frontend`)
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`

#### ML Service (`/ml_service`)
1. Create a virtual environment: `python -m venv venv`
2. Activate it: `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt` (or install FastAPI, transformers, torch, spacy)
4. Download SpaCy model: `python -m spacy download en_core_web_sm`
5. Run service: `python main.py`

---

## ⚙️ Environment Variables

### Backend
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for authentication |
| `ML_SERVICE_URL` | URL of the ML service (default: `http://localhost:8000`) |
| `CLOUDINARY_URL` | Cloudinary credentials |

---

## 📝 License
ISC
