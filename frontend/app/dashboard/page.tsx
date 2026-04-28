import Link from "next/link";
import { GitPullRequest, AlertTriangle, Clock, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INSTALL_URL } from "@/lib/constants";
import { fetchStats, fetchReviews } from "./data";

export default async function Page() {
  const [stats, reviews] = await Promise.all([fetchStats(), fetchReviews(10)]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">
          Activity from every PR Codexa has reviewed.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          icon={GitPullRequest}
          label="Total reviews"
          value={stats.total_reviews.toLocaleString()}
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.completed_reviews.toLocaleString()}
          accent="text-emerald-400"
        />
        <StatCard
          icon={AlertTriangle}
          label="Findings surfaced"
          value={stats.findings.toLocaleString()}
          accent="text-amber-400"
        />
        <StatCard
          icon={Clock}
          label="Avg duration"
          value={`${(stats.avg_duration_ms / 1000).toFixed(1)}s`}
          accent="text-blue-400"
        />
      </div>

      <section className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
          <h2 className="font-semibold">Recent reviews</h2>
        </div>
        {reviews.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-6">
              No reviews yet. Install Codexa on a repo, then open a PR to see it here.
            </p>
            <Link href={INSTALL_URL} target="_blank" rel="noopener">
              <Button variant="glow" size="lg">
                Install on a repository <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {reviews.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/dashboard/reviews/${r.id}`}
                  className="block px-6 py-4 hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {r.pr_title || `PR #${r.pr_number}`}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {r.repo} #{r.pr_number} · {r.summary || "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Pill status={r.status} />
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {r.findings_count ?? 0} findings
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent = "text-foreground",
}: {
  icon: typeof GitPullRequest;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="border-glow rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <div className="text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
    </div>
  );
}

function Pill({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    failed: "bg-red-500/15 text-red-400 border-red-500/30",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-md border text-[10px] uppercase font-bold tracking-wide ${
        map[status] ?? "bg-muted text-muted-foreground border-border"
      }`}
    >
      {status}
    </span>
  );
}
