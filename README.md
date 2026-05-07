# Architecture Mapper

> AI-powered software architecture designer. Describe any project idea and get a comprehensive, production-ready architecture in seconds — powered by Gemini.

![Architecture Mapper](https://img.shields.io/badge/Powered%20by-Gemini-8b5cf6?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Express%20%2B%20Supabase-6366f1?style=flat-square)

---

## Quick Start

### 1. Fill in your API key

Edit `.env.local` in the root:

```env
GEMINI_API_KEY=...             # Required — get from Google AI Studio or Vertex AI
```

### 2. Start both servers

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173**

---

## Phases Implemented

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Project scaffolding (Vite + React + TS + Express) | ✅ |
| 2 | API proxy — `/api/generate`, `/api/refine`, rate limiting | ✅ |
| 3 | Supabase Auth (Google + Email), DB schema, RLS | ✅ Code ready |
| 4 | Full UI — layers, tech stack, improvements, cost, risks | ✅ |
| 5 | Learning system — feedback injection, suggestion chips | ✅ |
| 6 | Markdown + JSON + PDF export, share links (`/arch/:slug`) | ✅ |
| 7 | Sentry, PostHog, GitHub Actions CI/CD, Vercel config | ✅ |

---

## Enabling Cloud Features (Phase 3)

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase_schema.sql` in the Supabase SQL Editor
3. Enable Google OAuth in Supabase → Authentication → Providers
4. Fill in `.env.local`:

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...     # Server-side only
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=...        # Browser-safe
```

Once configured, the app gains:
- ✅ Google / email sign-in
- ✅ Auto-save every architecture to the cloud
- ✅ Per-user history (last 20 architectures)
- ✅ Feedback logging + lesson injection into prompts
- ✅ Public share links (`/arch/:slug`)
- ✅ Preferred project type/scale remembered per user

---

## Enabling Monitoring (Phase 7)

```env
# Sentry — error tracking
SENTRY_DSN=https://xxx@sentry.io/...       # Backend
VITE_SENTRY_DSN=https://xxx@sentry.io/...  # Frontend

# PostHog — analytics
VITE_POSTHOG_KEY=phc_xxx
VITE_POSTHOG_HOST=https://app.posthog.com
```

---

## Deploying to Vercel (Phase 7)

### Frontend
```bash
cd frontend
vercel --prod
```
Add all `VITE_*` env vars in the Vercel dashboard.

### Backend
```bash
cd server
vercel --prod
```
Add `GEMINI_API_KEY`, `SUPABASE_*`, `SENTRY_DSN`, `FRONTEND_URL` in Vercel.

### GitHub Actions CI/CD
Add these secrets to your GitHub repo:
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_SENTRY_DSN`, `VITE_POSTHOG_KEY`

CI runs on every PR, deploys to Vercel on push to `main`.

---

## Project Structure

```
architecture-mapper/
├── .env.local                  # All env vars (never commit)
├── .github/workflows/ci.yml    # GitHub Actions CI/CD
├── supabase_schema.sql         # Run in Supabase SQL Editor
│
├── frontend/                   # React + Vite + Tailwind
│   ├── src/
│   │   ├── api/client.ts       # Axios API client
│   │   ├── components/         # UI components
│   │   ├── context/AuthContext # Supabase auth
│   │   ├── hooks/              # useArchitecture, useHistory, useCloudHistory
│   │   ├── lib/supabase.ts     # Browser Supabase client
│   │   ├── pages/SharePage.tsx # /arch/:slug public view
│   │   └── utils/              # export (MD/JSON/PDF), analytics
│   └── vercel.json
│
└── server/                     # Express + TypeScript
    ├── src/
    │   ├── index.ts            # Routes + rate limiter + Sentry
    │   ├── promptBuilder.ts    # Gemini system prompt
    │   ├── supabase.ts         # Admin DB client
    │   ├── sentry.ts           # Error tracking
    │   └── types.ts            # Shared types
    └── vercel.json
```
