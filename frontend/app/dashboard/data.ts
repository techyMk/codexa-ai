import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Severity = "info" | "warn" | "error";
export type ReviewStatus = "pending" | "completed" | "failed";

export type Finding = {
  file: string;
  line: number | null;
  severity: Severity;
  message: string;
  suggestion: string | null;
};

export type Review = {
  id: string;
  repo: string;
  pr_number: number;
  pr_url: string | null;
  pr_title: string | null;
  installation_id: number;
  provider: string;
  status: ReviewStatus;
  summary: string | null;
  findings_count: number | null;
  findings?: Finding[];
  duration_ms: number | null;
  error: string | null;
  created_at: string;
};

export type Stats = {
  total_reviews: number;
  completed_reviews: number;
  findings: number;
  avg_duration_ms: number;
};

export type RepoSettings = {
  skip_paths: string[];
  min_severity: Severity;
  extra_prompt: string;
  enabled: boolean;
};

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const EMPTY_STATS: Stats = {
  total_reviews: 0,
  completed_reviews: 0,
  findings: 0,
  avg_duration_ms: 0,
};

function buildUrl(path: string, params: Record<string, string | number | undefined> = {}) {
  const url = new URL(path, BACKEND);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }
  return url.toString();
}

async function authedFetch(url: string, init?: RequestInit): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  return fetch(url, {
    ...init,
    headers: {
      ...(init?.headers as Record<string, string> | undefined),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function fetchStats(): Promise<Stats> {
  try {
    const r = await authedFetch(buildUrl("/reviews/stats"), { cache: "no-store" });
    if (!r.ok) return EMPTY_STATS;
    return await r.json();
  } catch {
    return EMPTY_STATS;
  }
}

export async function fetchReviews(
  limit = 50,
  filters: { repo?: string; status?: ReviewStatus } = {},
): Promise<Review[]> {
  try {
    const r = await authedFetch(
      buildUrl("/reviews", { limit, repo: filters.repo, status: filters.status }),
      { cache: "no-store" },
    );
    if (!r.ok) return [];
    const data = await r.json();
    return data.reviews ?? [];
  } catch {
    return [];
  }
}

export async function fetchReview(id: string): Promise<Review | null> {
  try {
    const r = await authedFetch(buildUrl(`/reviews/${id}`), { cache: "no-store" });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export async function fetchUserRepos(): Promise<string[]> {
  try {
    const r = await authedFetch(buildUrl("/reviews/repos"), { cache: "no-store" });
    if (!r.ok) return [];
    const data = await r.json();
    return data.repos ?? [];
  } catch {
    return [];
  }
}

export async function fetchRepoSettings(owner: string, repo: string): Promise<RepoSettings> {
  try {
    const r = await authedFetch(buildUrl(`/settings/repos/${owner}/${repo}`), { cache: "no-store" });
    if (!r.ok) {
      return { skip_paths: [], min_severity: "info", extra_prompt: "", enabled: true };
    }
    return await r.json();
  } catch {
    return { skip_paths: [], min_severity: "info", extra_prompt: "", enabled: true };
  }
}
