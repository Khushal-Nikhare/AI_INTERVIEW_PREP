# AGENTS.md

> Guidance and instructions for AI coding agents (Antigravity, Claude Code, Cursor, Copilot) working on this codebase.

---

## Project Overview

**AI Interview Prep** is an AI-powered technical interview and aptitude preparation platform. It provides real-time interactive voice mock interviews using Vapi and Google Gemini, generates structured post-interview evaluations with category breakdowns, enables creation of custom interview templates, and delivers timed, AI-generated multiple-choice aptitude tests across quantitative, logical, and verbal categories.

---

## Tech Stack

- **Frontend Framework**: Next.js 15.4 (App Router), React 19.1, TypeScript 5
- **Styling & UI**: Tailwind CSS v4, Radix UI primitives (`@radix-ui/react-slot`, `@radix-ui/react-label`), Lucide React, Sonner (Toasts)
- **Forms & Validation**: React Hook Form, Zod v4 (`@hookform/resolvers`)
- **Backend API**: Python 3.10+, FastAPI 0.115, Uvicorn, Pydantic 2.9, Pydantic Settings
- **AI & Voice Services**: Google Gemini (`google-generativeai` SDK, `@ai-sdk/google`, `ai`), Vapi Web SDK (`@vapi-ai/web`), Deepgram (transcription), ElevenLabs (voice synthesis)
- **Database & Auth**: Firebase Firestore, Firebase Authentication, Firebase Admin SDK (Node.js `firebase-admin` & Python `firebase-admin`)
- **Package Managers**: `npm` (Frontend), `pip` / `venv` (Backend)

---

## Setup & Commands

### Frontend (`/`)
- **Install dependencies**: `npm install`
- **Run dev server**: `npm run dev` (or `npm run dev:turbo` for Turbopack)
- **Type check**: `npx tsc --noEmit`
- **Lint**: `npm run lint`
- **Build production bundle**: `npm run build`
- **Start production server**: `npm run start`
- **Tests**: *Not configured in package.json* (Jest/Vitest not yet installed)

### Backend (`/backend`)
- **Install dependencies**:
  ```powershell
  cd backend
  python -m venv venv
  .\venv\Scripts\activate
  pip install -r requirements.txt
  ```
- **Run backend API**:
  ```powershell
  python run.py
  # OR: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
  ```
- **Run backend test suite**:
  ```powershell
  python dev_resources/4_Scripts_and_Testing/backend_test_api.py
  ```

---

## Project Structure

```text
.
├── app/                              # Next.js App Router root
│   ├── (auth)/                       # Unauthenticated routes (sign-in, sign-up)
│   │   ├── layout.tsx                # Redirects authenticated users to home
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── (root)/                       # Protected routes requiring active session
│   │   ├── layout.tsx                # Session check & Navbar wrapper
│   │   ├── page.tsx                  # Home dashboard (interviews & aptitude summary)
│   │   ├── aptitude/                 # Aptitude test hub & test execution
│   │   │   ├── page.tsx              # Category selection hub
│   │   │   └── [category]/
│   │   │       ├── page.tsx          # Test runner page
│   │   │       └── result/page.tsx   # Test score & question review page
│   │   └── interview/                # Interview flows
│   │       ├── page.tsx              # AI Interview generation landing
│   │       ├── create/page.tsx       # Custom user interview creation form
│   │       └── [id]/
│   │           ├── page.tsx          # Voice interview room (Agent component)
│   │           └── feedback/page.tsx # Structured feedback & scorecard view
│   ├── api/vapi/generate/route.ts    # Webhook/proxy endpoint for interview generation
│   ├── globals.css                   # Global styles & design system utilities
│   └── layout.tsx                    # Root HTML layout with Toaster & font
├── backend/                          # Python FastAPI microservice
│   ├── app/
│   │   ├── api/                      # Route handlers
│   │   │   ├── interview.py          # /api/interview/generate & /api/interview/feedback
│   │   │   └── aptitude.py           # /api/aptitude/generate, /result, /results/{user_id}
│   │   ├── models/schemas.py         # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── ai_service.py         # GeminiKeyManager (multi-key pool) & prompt logic
│   │   │   └── firebase_service.py   # Firebase Admin Firestore singleton
│   │   ├── config.py                 # Pydantic Settings (.env configuration)
│   │   └── main.py                   # FastAPI app initialization, CORS & router mount
│   ├── requirements.txt              # Python dependency definitions
│   └── run.py                        # Local execution runner
├── components/                       # Shared React components
│   ├── ui/                           # UI primitives (button, form, input, label, sonner)
│   ├── Agent.tsx                     # Vapi Web voice call manager & speech state machine
│   ├── AptitudeCard.tsx              # Category card component for aptitude hub
│   ├── AptitudeResultCard.tsx        # Question-by-question review card
│   ├── AptitudeTest.tsx              # Client-side 30-min test engine with countdown
│   ├── AuthForm.tsx                  # Email/Password authentication form
│   ├── CustomInterviewForm.tsx       # Custom question builder form
│   ├── DisplayTechIcons.tsx          # Tech badge renderer
│   ├── InterviewCard.tsx             # Dashboard interview summary card
│   └── Navbar.tsx                    # Top navigation bar with user profile & logout
├── constants/index.ts                # Vapi assistant prompt configs, devicon mappings, dummy data
├── firebase/                         # Firebase SDK initializers
│   ├── admin.ts                      # Node.js Firebase Admin SDK (Server Actions)
│   └── client.ts                     # Client-side Firebase App & Auth SDK
├── lib/
│   ├── actions/                      # Next.js Server Actions ("use server")
│   │   ├── auth.action.ts            # signIn, signUp, signOut, getCurrentUser, session cookies
│   │   └── interview.action.ts       # Firestore queries & bridge calls to FastAPI
│   ├── utils.ts                      # Tailwind cn helper, tech logo resolver
│   └── vapi.sdk.ts                   # Vapi Web client singleton
├── types/                            # Global TypeScript ambient definitions
│   ├── index.d.ts                    # Interview, Feedback, Aptitude, User type definitions
│   └── vapi.d.ts                     # Vapi event & message types
└── dev_resources/                    # Documentation, architectural guides, test scripts
```

---

## Code Conventions

### TypeScript & React
- **Component Style**: Functional components with hooks only.
- **Directives**: Always explicitly mark `"use client";` for interactive components (`useState`, `useEffect`, event handlers) and `"use server";` for Server Action files.
- **Naming**:
  - Components: `PascalCase.tsx` (e.g., `CustomInterviewForm.tsx`).
  - Utilities / Actions: `camelCase.ts` or `kebab.action.ts` (e.g., `interview.action.ts`).
  - Types: Interfaces declared in `types/index.d.ts` without explicit imports.
- **State Management**: Local React state (`useState`, `useRef`, `useCallback`) alongside Server Actions; no external state stores (Redux/Zustand).

### Python & FastAPI
- **Naming**: `snake_case` for modules, functions, and variables; `PascalCase` for Pydantic models.
- **Schemas**: All API input and output payloads MUST use Pydantic models in `backend/app/models/schemas.py`.
- **Async I/O**: FastAPI route functions are `async def`. Do **NOT** run blocking sync operations directly on the event loop; use async SDK methods or `asyncio.to_thread`.

### Error Handling & Responses
- **Server Actions**: Return objects with `{ success: boolean, ... }` instead of throwing unhandled exceptions to the client:
  ```typescript
  return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  ```
- **Client Forms**: Catch errors and report user-friendly messages via `toast.error(message)` from `sonner`.

---

## Testing Requirements

1. **Static Analysis & Types**: Every change must pass `npx tsc --noEmit` with 0 errors.
2. **Linting**: Must pass `npm run lint` without breaking errors.
3. **Backend Key Rotation & Endpoints**: If modifying `backend/app/services/ai_service.py` or FastAPI endpoints, run `python dev_resources/4_Scripts_and_Testing/backend_test_api.py` and ensure all unit tests pass.
4. **No Automated CI Configured**: There is currently no `.github/workflows` in the repository; manual verification of builds (`npm run build`) is mandatory before finalizing changes.

---

## Do NOT

1. **Do NOT commit credentials or environment files**: Never commit `.env`, `.env.local`, `serviceAccountKey*.json`, `firebase-adminsdk*.json`, or private keys.
2. **Do NOT add `lib/` to `.gitignore`**: The Next.js `lib/` directory was previously ignored by a generic Python `.gitignore`, breaking deployment builds. Keep the exclusion rule active.
3. **Do NOT edit dead/backup files**: Ignore and do not modify `lib/actions/interview.action.old.ts`, `interview.action.new.ts`, or `app/api/vapi/generate/route.old.ts`. Work only on active files (`interview.action.ts`, `route.ts`).
4. **Do NOT execute invalid Firestore compound queries**: In Firestore, you cannot combine an inequality filter (`!=`, `>`, `<`) on field $A$ with an `orderBy()` on field $B$ unless field $A$ is the first `orderBy` clause.
5. **Do NOT invoke blocking LLM calls inside FastAPI async handlers**: Never call `model.generate_content()` synchronously inside `async def` without `asyncio.to_thread` or `generate_content_async`, as it starves the asyncio event loop.
6. **Do NOT use external image URLs without updating `next.config.ts`**: Any external image host (such as `cdn.jsdelivr.net`) must be declared under `images.remotePatterns` in `next.config.ts` to prevent `<Image />` component crashes.
7. **Do NOT use unchecked non-null assertions (`!`) on user sessions**: Always handle `user === null` gracefully rather than asserting `user?.id!`.

---

## Security Notes

- **Authentication Flow**: Authentication is handled via Firebase Client SDK on the frontend (`AuthForm.tsx`), which exchanges an `idToken` with the server action `signIn()` to establish an HTTP-only, `SameSite=Lax` session cookie (`session`) verified with Firebase Admin SDK.
- **Session Duration**: Default session cookie lifetime is set to 7 days (`60 * 60 * 24 * 7` seconds).
- **Private Key Handling**: When reading `FIREBASE_PRIVATE_KEY` from environment variables, always format newline characters using `.replace(/\\n/g, "\n")`.
- **FastAPI Endpoints**: The Python backend endpoints currently run without authentication headers. Exercise caution when exposing the backend port to public networks; validate user identity before performing mutations.

---

## PR & Commit Conventions

- Follow the **Conventional Commits** specification:
  - `feat: add aptitude score export`
  - `fix: resolve Firestore inequality ordering query error`
  - `chore: update dependencies and next.config.ts`
  - `refactor: optimize tech logo caching in utils`
