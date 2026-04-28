import Link from "next/link";
import { fetchReviews, fetchUserRepos, type ReviewStatus } from "../data";
import { ReviewFilters } from "@/components/dashboard/review-filters";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ repo?: string; status?: ReviewStatus }>;
}) {
  const sp = await searchParams;
  const [reviews, repos] = await Promise.all([
    fetchReviews(100, { repo: sp.repo, status: sp.status }),
    fetchUserRepos(),
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground mt-1">
            All PR reviews Codexa has generated.
          </p>
        </div>
      </header>

      <ReviewFilters repos={repos} currentRepo={sp.repo} currentStatus={sp.status} />

      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 text-xs uppercase text-muted-foreground tracking-wider">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Repository / PR</th>
                <th className="text-left px-6 py-3 font-medium">Provider</th>
                <th className="text-left px-6 py-3 font-medium">Findings</th>
                <th className="text-left px-6 py-3 font-medium">Duration</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-right px-6 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    No reviews match the current filter.
                  </td>
                </tr>
              )}
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-accent/20 transition-colors">
                  <td className="px-6 py-3 max-w-md">
                    <Link
                      href={`/dashboard/reviews/${r.id}`}
                      className="block hover:text-foreground"
                    >
                      <div className="font-medium truncate">
                        {r.pr_title || `PR #${r.pr_number}`}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                        {r.repo} #{r.pr_number}
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground font-mono text-xs">
                    {r.provider}
                  </td>
                  <td className="px-6 py-3 tabular-nums">{r.findings_count ?? 0}</td>
                  <td className="px-6 py-3 tabular-nums text-muted-foreground">
                    {r.duration_ms ? `${(r.duration_ms / 1000).toFixed(1)}s` : "—"}
                  </td>
                  <td className="px-6 py-3">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-6 py-3 text-right text-xs text-muted-foreground tabular-nums">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    failed: "bg-red-500/15 text-red-400 border-red-500/30",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse",
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
