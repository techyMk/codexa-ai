import Link from "next/link";
import { Github, Key, ExternalLink, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const appName = process.env.NEXT_PUBLIC_GITHUB_APP_NAME || "codexa";

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Account, install, and review preferences.</p>
      </header>

      <div className="space-y-4">
        <Card title="Account" icon={Github}>
          <Row label="Email" value={user?.email ?? "—"} />
          <Row label="GitHub username" value={(user?.user_metadata?.user_name as string) ?? "—"} />
        </Card>

        <Card title="GitHub App" icon={Github}>
          <p className="text-sm text-muted-foreground mb-4">
            Install Codexa on the repos you want reviewed. Uninstall anytime — no lock-in.
          </p>
          <Link href={`https://github.com/apps/${appName}/installations/new`} target="_blank">
            <Button variant="glow">
              Manage installations <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </Card>

        <Card title="Per-repository settings" icon={Sliders}>
          <p className="text-sm text-muted-foreground mb-4">
            Customize how Codexa reviews each repo — skip paths, severity threshold, and custom
            guidance for the AI.
          </p>
          <Link href="/dashboard/settings/repos">
            <Button variant="outline">Configure repositories</Button>
          </Link>
        </Card>

        <Card title="Bring your own keys" icon={Key}>
          <p className="text-sm text-muted-foreground mb-4">
            Use your own Gemini or Groq API keys to bypass shared rate limits. Keys are stored
            encrypted and never logged.
          </p>
          <Button variant="outline" disabled>Coming soon</Button>
        </Card>
      </div>
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Github;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
