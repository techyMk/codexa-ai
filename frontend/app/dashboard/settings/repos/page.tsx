import Link from "next/link";
import { ArrowLeft, ChevronRight, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchUserRepos } from "../../data";

export default async function Page() {
  const repos = await fetchUserRepos();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/dashboard/settings">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to settings
        </Button>
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Repository settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize how Codexa reviews each repository — skip paths, severity threshold, and
          custom guidance.
        </p>
      </header>

      {repos.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-12 text-center">
          <GitBranch className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No reviewed repositories yet. Open a PR in a repo where Codexa is installed, then come
            back here to customize.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur overflow-hidden">
          <ul className="divide-y divide-border/40">
            {repos.map((repo) => (
              <li key={repo}>
                <Link
                  href={`/dashboard/settings/repos/${repo}`}
                  className="flex items-center justify-between gap-3 px-6 py-4 hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <GitBranch className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-mono text-sm truncate">{repo}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
