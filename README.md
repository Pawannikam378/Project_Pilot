# ProjectPilot SaaS Application

ProjectPilot is an AI-powered SaaS platform designed for college students to upload, analyze, and enhance their academic projects. Powered by FastAPI, PostgreSQL, and React (Vite).

## Features
- **Project Document Processing:** Automatically extract text from PDF, DOCX, and PPTX files.
- **AI Asynchronous Processing:** Generate abstracts, key insights, methodological summaries, and potential Viva questions automatically without blocking the main event loop using FastAPI `BackgroundTasks`.
- **PowerPoint Generation:** Export analyzed summaries directly to downloadable `.pptx` presentations.
- **Plagiarism Tracking:** Compare documents using built-in NLP vectors and similarities.
- **Usage Tier Limits:** Built-in "Free" vs "Pro" subscription models to restrict daily/monthly uploads.
- **Demo Mode Configuration:** Can be fully run locally without external API keys (OpenAI / AWS / Razorpay). Will fallback to robust mock generators preserving the premium UI flow.

## 🚀 Deployment Guide & Local Setup

### 1. Local Setup via Docker (DB Only + FastAPI)
You can choose to run the backend and DB entirely via Docker compose, or just the DB.

**Run Everything (Backend + DB):**
```bash
docker compose up --build -d
```
The FastAPI backend will be available at `http://localhost:8000`. Swagger API docs accessible at `http://localhost:8000/docs`.

### 2. Frontend Local Setup
The frontend uses Vite and React.
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:5173`. Make sure the backend is running since Axios automatically calls `localhost:8000`.

### 3. Environment Variables
Create a `.env` file in the `backend/` directory based on the Docker `docker-compose.yml` specs.
To enable actual OpenAI or AWS features, set `DEMO_MODE=False` and supply:
- `OPENAI_API_KEY`
- `AWS_ACCESS_KEY_ID`
...etc.

### 4. Cloud Deployment (Production)
- **Database:** Create a managed PostgreSQL database via Supabase or Neon. Supply the connection string to `DATABASE_URL`.
- **Backend (Render):** 
  - Connect your GitHub repository to Render as a Web Service.
  - Set the root directory to `backend`.
  - Build Command: `pip install -r requirements.txt`.
  - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`.
- **Frontend (Vercel):**
  - Connect your repository to Vercel.
  - Set root folder to `frontend`.
  - Framework set to `Vite`.
  - Add `VITE_API_URL` pointing to your Render backend URL.

## API Documentation
Once running locally, the full OpenAPI spec is available at `/docs` detailing:
- `POST /api/signup` & `/api/login` - Uses OAuth2 JWT flow.
- `POST /api/projects/upload-project` - Multipart/form file parser.
- `POST /api/ai/generate-report/{project_id}` - Triggers BackgroundTasks.
- `GET /api/ai/task-status/{task_id}` - Status polling endpoint.