# CodeMentor AI

CodeMentor AI is a beginner-friendly full-stack AI starter project.

## Tech Stack

- Frontend: React + Vite + JavaScript
- Styling: Tailwind CSS
- Backend: FastAPI
- AI: Gemini API

## Folder Structure

```text
CodeMentor AI/
├─ frontend/
│  ├─ public/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ App.jsx
│  │  ├─ main.jsx
│  │  └─ index.css
│  ├─ index.html
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ tailwind.config.js
│  └─ vite.config.js
├─ backend/
│  ├─ app/
│  │  ├─ api/routes/
│  │  ├─ core/
│  │  ├─ schemas/
│  │  ├─ services/
│  │  └─ main.py
│  ├─ requirements.txt
│  └─ .env.example
└─ README.md
```

## Setup Commands

### 1) Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### 2) Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Dependencies

### Frontend

- react
- react-dom
- vite
- tailwindcss
- postcss
- autoprefixer

### Backend

- fastapi
- uvicorn
- google-generativeai
- python-dotenv

## Environment Variables

Create a file named `.env` inside `backend/` and add:

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

## How It Works

- The React app shows a simple chat-style interface.
- The FastAPI backend exposes a health check and a `/api/chat` endpoint.
- The backend sends your prompt to Gemini and returns the answer.
- If the Gemini key is missing, the backend returns a clear setup message instead of crashing.
