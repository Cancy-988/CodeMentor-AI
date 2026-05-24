Short deployment checklist

1. Supabase

- Create Supabase project
- Run `supabase/setup.sql` in SQL editor to create tables and storage
- In the Supabase UI, create a Storage bucket named `uploads` (public or private depending on your RLS rules)
- Enable Google OAuth and set redirect URLs for the frontend

2. Backend (Render)

- Build from `backend/Dockerfile` or use the `uvicorn` startup command
- Required env vars (set in Render):
  - `DATABASE_URL` (postgres)
  - `GEMINI_API_KEY` (optional)
  - `GEMINI_MODEL` (optional)
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_JWT_SECRET` (for verifying Supabase tokens)
  - `FRONTEND_URL` (your Vercel URL)
  - `CORS_ORIGINS` (comma separated list of allowed origins, e.g. `https://myapp.vercel.app`)

3. Frontend (Vercel)

- Set env vars in Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_BACKEND_URL`
- Build command: `npm run build`
- Output directory: `dist`

4. Render steps (backend)

- Add the repository in Render and select the `render.yaml` manifest to create the `codementor-ai-backend` service automatically.
- In Render dashboard, go to the service settings -> Environment -> Add the env vars listed above. For `CORS_ORIGINS` set the Vercel URL (and localhost during testing).
- Deploy and verify the health endpoint: `https://<your-render-service>.onrender.com/api/health`

5. Vercel steps (frontend)

- Connect the GitHub repository to Vercel.
- Configure the project root to `frontend` and set build command to `npm run build` and output directory to `dist`.
- Add the env vars in Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`), and `VITE_BACKEND_URL` (point to your Render service URL).

Quick verification:

1. Visit the backend health endpoint: `GET https://<render-service>/api/health` -> should return status `ok`.
2. Visit the deployed frontend URL; the app should load and auth should be configured with Supabase callbacks.

Notes:

- The backend Dockerfile installs `tesseract-ocr` so the local OCR fallback using `pytesseract` works. On some hosts you may prefer to use Gemini Vision instead of local OCR.
- After deployment, verify `/api/health` and the frontend root page.
