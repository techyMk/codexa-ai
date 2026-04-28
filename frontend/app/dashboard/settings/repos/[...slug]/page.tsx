import Link from "next/link";
import { ArrowLeft, GitBranch } from "lucide-react";
import { notFound } from "next/navigation";
import { fetchRepoSettings } from "../../../data";
import { RepoSettingsForm } from "@/components/dashboard/repo-settings-form";
import { Button } from "@/components/ui/button";

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug || slug.length < 2) notFound();

  const owner = slug[0];
  const repo = slug.slice(1).join("/"); // handle repos with slashes (rare)
  const fullName = `${owner}/${repo}`;

  const settings = await fetchRepoSettings(owner, repo);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/dashboard/settings/repos">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to repositories
        </Button>
      </Link>

      <header className="mb-8 pb-6 border-b border-border/40">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <GitBranch className="h-4 w-4" />
          <span className="font-mono">{fullName}</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Review settings</h1>
        <p className="text-muted-foreground mt-2">
          These settings apply to every PR review Codexa runs in this repository.
        </p>
      </header>

      <RepoSettingsForm owner={owner} repo={repo} initial={settings} />
    </div>
  );
}
