import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  GitPullRequest,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { fetchReview } from "../../data";
import { FindingCard } from "@/components/dashboard/finding-card";
import { Button } from "@/components/ui/button";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const review = await fetchReview(id);
  if (!review) notFound();

  const findings = review.findings ?? [];
  const errors = findings.filter((f) => f.severity === "error").length;
  const warns = findings.filter((f) => f.severity === "warn").length;
  const infos = findings.filter((f) => f.severity === "info").length;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/dashboard/reviews">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to reviews
        </Button>
      </Link>

      <header className="mb-8 pb-6 border-b border-border/40">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <GitPullRequest className="h-4 w-4 flex-shrink-0" />
              <span className="truncate font-mono">
                {review.repo} <span className="text-foreground">#{review.pr_number}</span>
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {review.pr_title || `PR #${review.pr_number}`}
            </h1>
          </div>
          <StatusBadge status={review.status} />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 text-sm text-muted-foreground">
          {review.pr_url && (
            <Link
              href={review.pr_url}
              target="_blank"
              rel="noopener"
              className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open PR on GitHub
            </Link>
          )}
          <span className="inline-flex items-center gap-1.5 font-mono text-xs">
            {review.provider}
          </span>
          {review.duration_ms && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {(review.duration_ms / 1000).toFixed(1)}s
            </span>
          )}
          <span className="text-xs tabular-nums">
            {new Date(review.created_at).toLocaleString()}
          </span>
        </div>
      </header>

      {/* Severity counters */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Counter label="Errors" value={errors} accent="text-red-400" emoji="🔴" />
        <Counter label="Warnings" value={warns} accent="text-amber-400" emoji="🟡" />
        <Counter label="Info" value={infos} accent="text-blue-400" emoji="🔵" />
      </div>

      {/* Summary */}
      {review.summary && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Summary
          </h2>
          <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-5">
            <p className="text-foreground/90 leading-relaxed">{review.summary}</p>
          </div>
        </section>
      )}

      {/* Findings */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Findings ({findings.length})
        </h2>
        {findings.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
            <p className="text-muted-foreground">No issues found in this PR.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {findings.map((f, i) => (
              <FindingCard key={i} finding={f} />
            ))}
          </div>
        )}
      </section>

      {/* Error block */}
      {review.status === "failed" && review.error && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-red-400 mb-3">
            Error
          </h2>
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <pre className="text-sm text-red-300 whitespace-pre-wrap font-mono break-all">
              {review.error}
            </pre>
          </div>
        </section>
      )}
    </div>
  );
}

function Counter({
  label,
  value,
  accent,
  emoji,
}: {
  label: string;
  value: number;
  accent: string;
  emoji: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-base">{emoji}</span>
      </div>
      <div className={`text-3xl font-semibold tabular-nums ${accent}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map = {
    completed: {
      icon: CheckCircle2,
      cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    failed: { icon: XCircle, cls: "bg-red-500/15 text-red-400 border-red-500/30" },
    pending: { icon: AlertTriangle, cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  } as const;
  const m = map[status as keyof typeof map] ?? map.pending;
  const Icon = m.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-bold uppercase tracking-wider ${m.cls}`}
    >
      <Icon className="h-3.5 w-3.5" /> {status}
    </span>
  );
}
