# AI Interview Prep Platform

An AI-powered technical interview and aptitude preparation platform with real-time interactive voice mock interviews using Vapi and Google Gemini, structured post-interview evaluations, custom question generation, and timed multiple-choice aptitude tests.

---

## Architecture Overview

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend API**: Python FastAPI, Uvicorn, Google Gemini SDK (`google-generativeai`), Pydantic Settings
- **Services & Storage**: Firebase Firestore, Firebase Authentication, Vapi Web SDK

---

## Running with Docker (Recommended)

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 2. Configure Environment Variables
Ensure you have the required credentials in your `.env` or pass them in a `.env` file at the root:

```env
# Frontend Public Variables
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_published_vapi_assistant_id
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Backend & Private Firebase Credentials
GOOGLE_API_KEY=your_gemini_api_key
GOOGLE_API_KEYS=optional_comma_separated_secondary_keys
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_CLIENT_ID=your_client_id
BACKEND_SECRET_KEY=your_optional_internal_secret_token
```

### 3. Build & Run Containers with Docker Compose

To start both the Frontend and Backend services in containers:

```bash
docker compose up --build
```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **FastAPI Health / API**: [http://localhost:8000](http://localhost:8000)

To stop running containers:
```bash
docker compose down
```

---

## Building Docker Images Individually

### Backend Image
```bash
docker build -t ai-interview-backend -f backend/Dockerfile .
docker run -p 8000:8000 --env-file backend/.env ai-interview-backend
```

### Frontend Image
```bash
docker build -t ai-interview-frontend -f Dockerfile .
docker run -p 3000:3000 -e BACKEND_URL=http://host.docker.internal:8000 ai-interview-frontend
```
