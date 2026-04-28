import type { Metadata } from "next";
import Link from "next/link";
import { DocHeader, H2, H3, P, Pre, Callout } from "@/components/docs/docs-content";
import { GITHUB_REPO_URL } from "@/lib/constants";

export const metadata: Metadata = { title: "Self-host Codexa" };

export default function Page() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="Self-host Codexa"
        summary="Run Codexa on your own infrastructure with your own AI keys. Stays free across the entire stack."
      />

      <P>
        The hosted version of Codexa is convenient, but you may prefer to self-host for full
        control over data residency, custom prompts, or just to learn how the system works. This
        guide walks through every step.
      </P>

      <H2>What you&apos;ll need</H2>
      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
        <li>Node 20+ and Python 3.12+</li>
        <li>A free Supabase project (Auth + Postgres)</li>
        <li>A free Google Gemini API key, a free Groq API key, or both</li>
        <li>A GitHub account with a repo to test on</li>
        <li>Free-tier accounts on Vercel and Render (or your own VPS)</li>
      </ul>

      <Callout variant="info">
        Total monthly cost on default tier: $0. The whole stack uses only free providers.
      </Callout>

      <H2>1. Clone the repo</H2>
      <Pre lang="bash">{`git clone ${GITHUB_REPO_URL}.git
cd codexa`}</Pre>

      <H2>2. Set up Supabase</H2>
      <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mt-3">
        <li>
          Create a project at <Link href="https://supabase.com" className="text-primary hover:underline" target="_blank">supabase.com</Link>
        </li>
        <li>
          In the SQL editor, run <code className="font-mono">supabase/migrations/001_init.sql</code> followed by <code className="font-mono">002_review_detail_and_settings.sql</code>
        </li>
        <li>
          Authentication → Providers → enable <strong className="text-foreground">GitHub</strong> (instructions below in the GitHub OAuth step)
        </li>
        <li>
          Settings → API: copy the project URL, publishable (anon) key, and secret (service role) key
        </li>
      </ol>

      <H2>3. Create a GitHub App</H2>
      <P>
        Visit GitHub → Settings → Developer settings → GitHub Apps → New GitHub App. Use these
        values:
      </P>
      <Pre>{`Name:                  codexa-<your-username>
Homepage URL:          https://your-frontend-domain
Webhook URL:           https://your-backend-domain/webhooks/github
Webhook secret:        (generate a random 32-byte hex string)
Permissions:
  Pull requests:       Read and write
  Contents:            Read-only
  Checks:              Read and write
Subscribe to events:   Pull request`}</Pre>

      <P>
        After creating, generate a private key (downloads a .pem file) and copy the App ID, Client
        ID, and a fresh client secret.
      </P>

      <H2>4. Create a GitHub OAuth App (for dashboard sign-in)</H2>
      <P>
        Separate from the GitHub App. Settings → Developer settings → OAuth Apps → New OAuth App.
      </P>
      <Pre>{`Name:                          Codexa Login
Homepage:                      https://your-frontend-domain
Authorization callback URL:    https://<your-supabase>.supabase.co/auth/v1/callback`}</Pre>

      <H2>5. Configure environment variables</H2>
      <H3>backend/.env</H3>
      <Pre lang="env">{`GITHUB_APP_ID=...
GITHUB_APP_CLIENT_ID=...
GITHUB_APP_CLIENT_SECRET=...
GITHUB_APP_PRIVATE_KEY_PATH=github-app.pem
GITHUB_WEBHOOK_SECRET=...
GEMINI_API_KEY=...
GROQ_API_KEY=...
SUPABASE_URL=https://....supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
FRONTEND_URL=http://localhost:3000`}</Pre>

      <P>
        Place the GitHub App private key file (the <code className="font-mono">.pem</code> you
        downloaded) at{" "}
        <code className="font-mono">backend/github-app.pem</code>.
      </P>

      <H3>frontend/.env.local</H3>
      <Pre lang="env">{`NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_GITHUB_APP_NAME=codexa-yourname
NEXT_PUBLIC_GITHUB_REPO_URL=https://github.com/yourname/codexa`}</Pre>

      <H2>6. Run locally</H2>
      <P>Two terminals:</P>
      <Pre lang="bash">{`# Backend
cd backend
python -m venv .venv
.venv/Scripts/Activate.ps1   # Windows; on Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload`}</Pre>
      <Pre lang="bash">{`# Frontend
cd frontend
npm install
npm run dev`}</Pre>

      <H2>7. Tunnel the webhook (dev only)</H2>
      <P>
        GitHub needs to reach your local backend over HTTPS. Use ngrok or Cloudflare Tunnel:
      </P>
      <Pre lang="bash">{`ngrok http 8000
# or
cloudflared tunnel --url http://localhost:8000`}</Pre>
      <P>
        Paste the public URL (with <code className="font-mono">/webhooks/github</code> appended)
        into your GitHub App&apos;s webhook URL field.
      </P>

      <H2>8. Deploy to production</H2>
      <H3>Backend → Render</H3>
      <P>
        On Render, &quot;New + Blueprint&quot;, point to your repo. Render reads{" "}
        <code className="font-mono">render.yaml</code> at the repo root and provisions the service.
        Set all the env vars from <code className="font-mono">backend/.env</code> in the Render
        dashboard. Paste the entire .pem file content (including BEGIN/END lines) into the{" "}
        <code className="font-mono">GITHUB_APP_PRIVATE_KEY</code> env var (Render handles
        multi-line values natively).
      </P>

      <H3>Frontend → Vercel</H3>
      <P>
        Import the repo on Vercel. <strong className="text-foreground">Set Root Directory to{" "}
        <code className="font-mono">frontend</code></strong> — this is critical. Add the env vars
        from <code className="font-mono">frontend/.env.local</code>, with{" "}
        <code className="font-mono">NEXT_PUBLIC_BACKEND_URL</code> pointed at the Render URL.
      </P>

      <H3>Update production URLs</H3>
      <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-2">
        <li>GitHub App → Webhook URL → your Render URL + <code className="font-mono">/webhooks/github</code></li>
        <li>GitHub App → Homepage URL → your Vercel URL</li>
        <li>Supabase → Authentication → URL Configuration → Site URL + Redirect URLs</li>
        <li>Render env → <code className="font-mono">FRONTEND_URL</code> = Vercel URL</li>
      </ul>

      <Callout variant="warn" title="Free tier cold starts">
        Render&apos;s free tier sleeps services after 15 minutes of inactivity. The first webhook
        after a sleep takes 30–60s to wake the container. GitHub auto-retries, so no reviews are
        lost — but expect occasional cold starts.
      </Callout>
    </>
  );
}
