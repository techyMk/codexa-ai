"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import type { ReviewStatus } from "@/app/dashboard/data";

export function ReviewFilters({
  repos,
  currentRepo,
  currentStatus,
}: {
  repos: string[];
  currentRepo?: string;
  currentStatus?: ReviewStatus;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  function setParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(sp.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard/reviews?${params.toString()}`);
  }

  const hasFilter = !!(currentRepo || currentStatus);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="font-medium">Filters:</span>
      </div>

      <select
        value={currentRepo ?? "all"}
        onChange={(e) => setParam("repo", e.target.value)}
        className="bg-card/40 border border-border/60 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
      >
        <option value="all">All repositories</option>
        {repos.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <select
        value={currentStatus ?? "all"}
        onChange={(e) => setParam("status", e.target.value)}
        className="bg-card/40 border border-border/60 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
      >
        <option value="all">All statuses</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
        <option value="failed">Failed</option>
      </select>

      {hasFilter && (
        <button
          onClick={() => router.push("/dashboard/reviews")}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" /> Clear
        </button>
      )}
    </div>
  );
}
