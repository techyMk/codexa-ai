import type { Metadata } from "next";
import { DocHeader, H2, P, Pre, Callout } from "@/components/docs/docs-content";

export const metadata: Metadata = { title: "Webhook events" };

export default function Page() {
  return (
    <>
      <DocHeader
        eyebrow="Reference"
        title="Webhook events"
        summary="What Codexa listens for, how it verifies requests, and what triggers a review."
      />

      <H2>Endpoint</H2>
      <Pre>{`POST /webhooks/github`}</Pre>

      <H2>Verification</H2>
      <P>
        Every webhook is verified using HMAC-SHA256. The signature in the{" "}
        <code className="font-mono">X-Hub-Signature-256</code> header is compared against an
        HMAC of the raw request body using your{" "}
        <code className="font-mono">GITHUB_WEBHOOK_SECRET</code>. Mismatched requests return 401
        without doing any work — protecting the AI quota and database from spam.
      </P>

      <H2>Events Codexa subscribes to</H2>
      <P>
        Only <code className="font-mono">pull_request</code> events trigger a review. The bot
        responds to four actions:
      </P>
      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
        <li><code className="font-mono">opened</code> — first review on a brand-new PR</li>
        <li><code className="font-mono">reopened</code> — re-review when a closed PR comes back</li>
        <li><code className="font-mono">synchronize</code> — re-review on every new commit pushed to the PR</li>
        <li><code className="font-mono">ready_for_review</code> — when a draft PR is marked ready</li>
      </ul>

      <P>
        All other actions (assigned, labeled, edited, etc.) and all other events are ignored with
        a 200 OK + <code className="font-mono">{"{ok: true, ignored: <event>}"}</code>.
      </P>

      <Callout variant="info" title="Draft PRs are skipped">
        If <code className="font-mono">pull_request.draft</code> is true, no review fires.
        Convert the PR to ready-for-review to trigger Codexa.
      </Callout>

      <H2>Lifecycle of a review</H2>
      <Pre>{`1. GitHub sends pull_request webhook
2. /webhooks/github verifies HMAC signature      → 401 on mismatch
3. Insert "pending" review row in Supabase       → dashboard shows activity
4. Return 200 OK to GitHub immediately           → ack within ~50ms
5. Background task: fetch PR diff via REST API
6. Background task: create "in_progress" check run on the PR head SHA
7. Background task: AIRouter calls Gemini → falls back to Groq on failure
8. Background task: filter findings by per-repo severity threshold
9. Background task: render Markdown comment + post via /issues/comments
10. Background task: update check run with success/failure conclusion
11. Background task: update Supabase row to "completed" with findings JSON`}</Pre>

      <P>
        Total time: typically 6–12 seconds, rarely &gt; 20s. The webhook itself returns within
        ~50ms because all the work is offloaded to a FastAPI background task.
      </P>

      <H2>Failure modes</H2>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
        <li>
          <strong className="text-foreground">Diff fetch fails</strong> — typically a transient
          GitHub API issue. Review marked failed; check run marked neutral with a friendly
          message.
        </li>
        <li>
          <strong className="text-foreground">All AI providers exhausted</strong> — both Gemini
          and Groq returned 429 or errored. Review marked failed with the last error in the row.
        </li>
        <li>
          <strong className="text-foreground">Comment post fails</strong> — installation token
          expired mid-flight, or GitHub API hiccup. Review row keeps the AI summary and findings
          (so the dashboard still shows them) but is marked failed.
        </li>
      </ul>

      <H2>Skipping a review</H2>
      <P>Two ways:</P>
      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
        <li>Open the PR as a <strong className="text-foreground">draft</strong> — no review fires until you mark it ready</li>
        <li>Disable Codexa for the repo in <code className="font-mono">/dashboard/settings/repos/{`{repo}`}</code></li>
      </ul>
    </>
  );
}
