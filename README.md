<div align="center">

<img src="frontend/assets/codex-logo.svg" alt="Codexa" width="320" />

### AI code review on every GitHub pull request

Catches bugs, security issues, and bad patterns before merge — without slowing your CI.

[![CI](https://img.shields.io/github/actions/workflow/status/techyMk/codexa/ci.yml?branch=main&label=CI&logo=github)](.github/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3FCF8E?logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-deployed-black?logo=vercel)](https://vercel.com)
[![Render](https://img.shields.io/badge/Render-deployed-46E3B7?logo=render)](https://render.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

[**Live demo**](https://codexa-ai-techymk.vercel.app) · [**Install bot**](https://github.com/apps/codexa-bot/installations/new) · [**Docs**](https://codexa-ai-techymk.vercel.app/docs)

</div>

---

# Codexa

Codexa is a GitHub App that auto-reviews every pull request with AI. It catches bugs, security
issues, and bad patterns before merge, and posts findings as a single review comment with
file, line, severity, and concrete fix suggestions — plus a status check that can block merges
on critical issues.

- **Frontend** — Next.js 15 (App Router) + Tailwind + Framer Motion → Vercel
- **Backend** — FastAPI + httpx + structlog → Render (Docker)
- **AI** — Gemini 2.0 Flash (primary) → Groq Llama 3.3 70B (fallback) — both **free**
- **DB / Auth** — Supabase (Postgres + GitHub OAuth) — **free**
- **CI/CD** — GitHub Actions

Total monthly cost on default tier: **$0**.

---

## Architecture

```
┌──────────────┐     PR opened      ┌────────────────┐
│   GitHub     │ ─────────────────▶ │ FastAPI        │
│   (PR + App) │   webhook (HMAC)   │ /webhooks/...  │
└──────────────┘                    └───────┬────────┘
       ▲                                    │ background task
       │ comment posted                     ▼
       │                            ┌────────────────┐
       │                            │ AIRouter       │
       │                            │  ├ Gemini      │
       │                            │  └ Groq (fb)   │
       │                            └───────┬────────┘
       │                                    ▼
       │                            ┌────────────────┐
       └────────────────────────────│ render comment │
                                    │ + log Supabase │
                                    └────────────────┘
```

The Next.js dashboard reads from `/reviews` and `/reviews/stats` to show activity.

---

## Repository layout

```
codexa/
├── backend/                  # FastAPI service
│   ├── app/
│   │   ├── main.py           # FastAPI factory
│   │   ├── config.py         # Pydantic settings
│   │   ├── core/             # logging, security (HMAC, JWT)
│   │   ├── routes/           # /webhooks/github, /reviews, /healthz
│   │   ├── services/
│   │   │   ├── ai/           # gemini.py, groq.py, router.py, parser.py
│   │   │   ├── github.py     # diff fetch, comment post, token cache
│   │   │   └── reviewer.py   # orchestrates a single review
│   │   └── db/supabase.py    # service-role client
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # Next.js 15
│   ├── app/
│   │   ├── page.tsx          # landing
│   │   ├── login/            # GitHub OAuth via Supabase
│   │   ├── auth/callback/    # OAuth callback handler
│   │   └── dashboard/        # overview, reviews, settings
│   ├── components/
│   │   ├── landing/          # hero, features, how-it-works, pricing, cta
│   │   ├── ui/               # button, badge
│   │   └── navbar.tsx
│   ├── lib/supabase/         # client, server, middleware
│   └── middleware.ts         # protects /dashboard
├── supabase/migrations/001_init.sql
├── .github/workflows/        # ci.yml, deploy.yml
├── render.yaml               # backend deploy descriptor
└── docker-compose.yml        # local backend
```

---

## Local development

### 1. Prereqs

- Node 20+, Python 3.12+, Docker (optional)
- A free Supabase project, a Gemini API key, a Groq API key
- A GitHub App (instructions below)

### 2. Clone and configure

```bash
git clone <repo> codexa && cd codexa
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Fill in the values in each `.env*` file.

### 3. Create the GitHub App

Go to **github.com → Settings → Developer settings → GitHub Apps → New GitHub App**.

| Field                   | Value                                                              |
| ----------------------- | ------------------------------------------------------------------ |
| Name                    | Codexa (must be unique on GitHub)                                  |
| Homepage URL            | `http://localhost:3000`                                            |
| Webhook URL             | `https://<your-tunnel>.ngrok.io/webhooks/github` (use ngrok in dev)|
| Webhook secret          | a long random string — paste into `GITHUB_WEBHOOK_SECRET`          |
| Repository permissions  | **Pull requests: Read & write**, **Contents: Read**, **Metadata: Read** |
| Subscribe to events     | **Pull request**                                                   |

After creating: note the **App ID**, generate a **private key** (`.pem`), and install the app on
a test repo. Paste the `.pem` contents into `GITHUB_APP_PRIVATE_KEY` (newlines as `\n`).

### 4. Initialize the database

In the Supabase SQL editor, run [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql).

In **Authentication → Providers → GitHub**, enable GitHub OAuth and paste the OAuth client ID/secret
from your GitHub App. Add `http://localhost:3000/auth/callback` and your production URL to the
allowed redirect URLs.

### 5. Get free AI keys

- **Gemini** — https://aistudio.google.com/app/apikey (1,500 req/day free)
- **Groq** — https://console.groq.com/keys (free tier, very fast)

### 6. Run

Two terminals:

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

```bash
# Frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

### 7. Test the webhook end-to-end

```bash
ngrok http 8000
# Copy the https URL into your GitHub App's webhook URL
# Open a PR in a repo where the App is installed → Codexa comments within ~10s
```

---

## Production deploy (free)

### Backend → Render

1. Push the repo to GitHub.
2. On Render, **New + Blueprint** → point to your repo. It picks up [`render.yaml`](render.yaml).
3. Set the environment variables from `backend/.env` in the Render dashboard.
4. Update the GitHub App webhook URL to `https://<your-render-url>/webhooks/github`.

### Frontend → Vercel

1. Import the repo on Vercel. Set the **Root Directory** to `frontend`.
2. Add the env vars from `frontend/.env.local.example` (point `NEXT_PUBLIC_BACKEND_URL` at Render).
3. Deploy. Add the production domain to your Supabase OAuth allowed URLs.

### Database → Supabase

Already provisioned — just keep the project on the free tier.

---

## How a review actually runs

1. GitHub fires a `pull_request` webhook with action `opened`, `reopened`, `synchronize`, or `ready_for_review`.
2. `core/security.verify_webhook_signature` validates the HMAC SHA-256 against `GITHUB_WEBHOOK_SECRET`.
3. We mint a short-lived installation access token (`core/security.create_app_jwt` → `/installations/:id/access_tokens`), cached for 50 min.
4. We fetch the unified diff via `Accept: application/vnd.github.v3.diff`.
5. `services/ai/router.AIRouter` tries Gemini first; if it raises, falls back to Groq.
6. The model returns strict JSON: a summary plus an array of findings.
7. We render a Markdown comment and POST to `/repos/:owner/:repo/issues/:n/comments`.
8. The result is logged to the `reviews` table.

Tunable bits:
- `services/ai/prompt.SYSTEM_PROMPT` — change tone, focus areas, severity rubric
- `services/ai/prompt.build_user_prompt` — diff truncation threshold (default 60 KB)
- `services/github.render_review_comment` — comment formatting
- `routes/webhooks._REVIEWABLE_ACTIONS` — which PR events trigger a review

---

## Why this stack stays free

| Component | Provider          | Free tier                     |
| --------- | ----------------- | ----------------------------- |
| Frontend  | Vercel            | 100 GB bandwidth / month      |
| Backend   | Render (Docker)   | 750 hours / month             |
| Database  | Supabase          | 500 MB Postgres + 50k MAU     |
| AI #1     | Google Gemini     | 1,500 requests / day          |
| AI #2     | Groq (Llama 3.3)  | Generous free tier            |
| CI        | GitHub Actions    | 2,000 min / month (private)   |

If you hit Gemini's daily cap, every subsequent review automatically falls through to Groq.

---

## License

MIT.
