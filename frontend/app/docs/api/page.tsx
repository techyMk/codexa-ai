import type { Metadata } from "next";
import { DocHeader, H2, H3, P, Pre, Callout, ApiRow } from "@/components/docs/docs-content";

export const metadata: Metadata = { title: "API reference" };

export default function Page() {
  return (
    <>
      <DocHeader
        eyebrow="Reference"
        title="API reference"
        summary="REST endpoints for the dashboard. All review endpoints require a valid Supabase JWT in the Authorization header."
      />

      <H2>Base URL</H2>
      <Pre>{`https://your-backend.onrender.com`}</Pre>

      <H2>Authentication</H2>
      <P>
        Dashboard endpoints expect a Supabase access token in the{" "}
        <code className="font-mono">Authorization</code> header:
      </P>
      <Pre lang="http">{`GET /reviews HTTP/1.1
Host: codexa-backend.onrender.com
Authorization: Bearer <supabase_access_token>`}</Pre>

      <P>
        The token is verified server-side via Supabase JWKS (RS256/ES256) — falling back to HS256
        if your project uses a shared JWT secret. Invalid or missing tokens return 401.
      </P>

      <Callout variant="warn" title="Webhook auth is different">
        The <code className="font-mono">/webhooks/github</code> endpoint uses HMAC-SHA256 verified
        against <code className="font-mono">GITHUB_WEBHOOK_SECRET</code> — not Supabase JWT.
      </Callout>

      <H2>Health</H2>
      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-2 px-5">
        <ApiRow method="GET" path="/" desc="Service liveness probe. Returns service name and status." />
        <ApiRow method="GET" path="/healthz" desc="Readiness probe with provider configuration flags." />
      </div>

      <H2>Reviews</H2>
      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-2 px-5">
        <ApiRow
          method="GET"
          path="/reviews"
          desc="List recent reviews scoped to the signed-in user. Query params: limit (1-200), repo, status (pending/completed/failed)."
        />
        <ApiRow
          method="GET"
          path="/reviews/{id}"
          desc="Full review record including the findings JSON array. Returns 404 if the review isn't owned by the requesting user."
        />
        <ApiRow
          method="GET"
          path="/reviews/repos"
          desc="Distinct repository names the user has reviews for. Used to populate the dashboard filter dropdown."
        />
        <ApiRow
          method="GET"
          path="/reviews/stats"
          desc="Aggregate counters: total reviews, completed reviews, total findings, average duration."
        />
      </div>

      <H3>Example response — GET /reviews/{`{id}`}</H3>
      <Pre lang="json">{`{
  "id": "9f3a4e21-...",
  "repo": "techymk/codexa-test",
  "pr_number": 12,
  "pr_url": "https://github.com/techymk/codexa-test/pull/12",
  "pr_title": "Add user lookup helpers",
  "installation_id": 127619686,
  "provider": "gemini-2.0-flash",
  "status": "completed",
  "summary": "Solid setup overall. Two issues to fix before merge.",
  "findings": [
    {
      "file": "auth/jwt.py",
      "line": 24,
      "severity": "error",
      "message": "App crashes silently if SECRET_KEY isn't set.",
      "suggestion": "Fail fast at startup with an explicit assertion."
    }
  ],
  "findings_count": 1,
  "duration_ms": 8123,
  "error": null,
  "created_at": "2026-04-28T20:31:14Z"
}`}</Pre>

      <H2>Settings</H2>
      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-2 px-5">
        <ApiRow
          method="GET"
          path="/settings/repos/{owner}/{repo}"
          desc="Get per-repo settings. Returns defaults if no row exists."
        />
        <ApiRow
          method="PUT"
          path="/settings/repos/{owner}/{repo}"
          desc="Upsert per-repo settings. Body: skip_paths, min_severity, extra_prompt, enabled."
        />
      </div>

      <H3>Settings request body</H3>
      <Pre lang="json">{`{
  "skip_paths": ["package-lock.json", "*.lock", "migrations/**"],
  "min_severity": "warn",
  "extra_prompt": "We use SQLAlchemy 2.x. Flag legacy Query API usage.",
  "enabled": true
}`}</Pre>

      <H2>Webhooks</H2>
      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-2 px-5">
        <ApiRow
          method="POST"
          path="/webhooks/github"
          desc="GitHub webhook receiver. HMAC-verified. Processes pull_request events asynchronously."
        />
      </div>

      <H2>Error responses</H2>
      <P>All errors return JSON with a <code className="font-mono">detail</code> field:</P>
      <Pre lang="json">{`{ "detail": "missing bearer token" }`}</Pre>

      <P>Status codes:</P>
      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
        <li><code className="font-mono">401</code> — missing or invalid JWT (dashboard); invalid HMAC (webhook)</li>
        <li><code className="font-mono">403</code> — JWT valid but the resource isn&apos;t yours</li>
        <li><code className="font-mono">404</code> — review/setting not found</li>
        <li><code className="font-mono">500</code> — backend or Supabase error (check Render logs)</li>
      </ul>
    </>
  );
}
