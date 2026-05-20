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
- The FastAPI backend exposes a health check, a `/api/chat` endpoint, and a `/review-code` endpoint.
- The chat endpoint sends a question to Gemini and returns the answer.
- The review endpoint sends code plus its programming language to Gemini and returns an AI-generated code review.
- If the Gemini key is missing, the backend returns a clear setup message instead of crashing.

## Backend Files

- `backend/app/main.py`: creates the FastAPI app, enables CORS, and registers routes.
- `backend/app/api/routes/health.py`: returns a basic health check.
- `backend/app/api/routes/chat.py`: keeps the original chat endpoint.
- `backend/app/api/routes/review.py`: handles `POST /review-code`.
- `backend/app/schemas/chat.py`: defines the request and response shapes for chat.
- `backend/app/schemas/review.py`: defines the request and response shapes for code review.
- `backend/app/services/gemini.py`: builds Gemini prompts and sends requests to the Gemini API.
- `backend/app/core/config.py`: stores simple environment-driven settings.

## RAG Layer

CodeMentor AI now uses a simple RAG pipeline so the review agents can pull in coding rules before they answer.

- `backend/app/rag/documents.py`: stores the built-in best practices, DSA notes, and clean code guidance.
- `backend/app/rag/vectorstore.py`: creates a Chroma vector database and stores embeddings for the documents.
- `backend/app/rag/retriever.py`: looks up the most relevant rules for the user's code.

### Embeddings

Embeddings turn text into numeric vectors. Similar text ends up with vectors that are close together, which lets the app search for related coding rules even when the words are not exactly the same.

### Vector Database

Chroma stores those vectors and lets the backend search them quickly. In this project, it acts like a small searchable memory for coding best practices.

### Retrieval Flow

1. The user sends code and a language.
2. The backend converts that code into a retrieval query.
3. Chroma finds the most relevant notes and rules.
4. The review agents read that retrieved context.
5. Gemini generates the final review using both the code and the retrieved rules.

## Multi-Agent Workflow

The code review endpoint now runs a simple pipeline with five agents:

- `backend/app/agents/language_detection.py`: detects the programming language from the code.
- `backend/app/agents/bug_detection.py`: finds bugs, edge cases, and risky behavior.
- `backend/app/agents/fix_suggestion.py`: suggests practical fixes and an improved version.
- `backend/app/agents/complexity_analysis.py`: estimates time and space complexity.
- `backend/app/agents/explanation.py`: explains the issues in simple beginner-friendly language.
- `backend/app/agents/workflow.py`: connects all agents and returns one combined JSON response.

The `/review-code` endpoint accepts `code` and `language`, sends them through the workflow, and returns a structured JSON object with all agent results.
