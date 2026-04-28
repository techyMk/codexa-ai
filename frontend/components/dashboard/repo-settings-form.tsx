"use client";

import { useState, useTransition } from "react";
import { Save, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { RepoSettings, Severity } from "@/app/dashboard/data";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const SEVERITY_OPTIONS: { value: Severity; label: string; desc: string }[] = [
  { value: "info", label: "Info", desc: "Surface every finding, including minor suggestions" },
  { value: "warn", label: "Warn", desc: "Skip info-level — show warnings and errors only" },
  { value: "error", label: "Error", desc: "Only block-worthy issues. Quietest setting." },
];

export function RepoSettingsForm({
  owner,
  repo,
  initial,
}: {
  owner: string;
  repo: string;
  initial: RepoSettings;
}) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [minSeverity, setMinSeverity] = useState<Severity>(initial.min_severity);
  const [skipPaths, setSkipPaths] = useState<string[]>(initial.skip_paths);
  const [newPath, setNewPath] = useState("");
  const [extraPrompt, setExtraPrompt] = useState(initial.extra_prompt);
  const [pending, startTransition] = useTransition();

  function addSkipPath() {
    const p = newPath.trim();
    if (!p) return;
    if (skipPaths.includes(p)) {
      toast.error("Already in the list");
      return;
    }
    setSkipPaths([...skipPaths, p]);
    setNewPath("");
  }

  function removeSkipPath(p: string) {
    setSkipPaths(skipPaths.filter((x) => x !== p));
  }

  async function save() {
    startTransition(async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      try {
        const r = await fetch(`${BACKEND}/settings/repos/${owner}/${repo}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            enabled,
            min_severity: minSeverity,
            skip_paths: skipPaths,
            extra_prompt: extraPrompt,
          }),
        });
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.detail || "Failed to save");
        }
        toast.success("Settings saved");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Enabled toggle */}
      <Section title="Enabled" desc="Pause reviews on this repo without uninstalling Codexa.">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-5 w-5 rounded border-border/60 bg-card/40 cursor-pointer accent-violet-500"
          />
          <span className="text-sm">
            {enabled ? "Reviews run on every PR" : "Reviews paused for this repo"}
          </span>
        </label>
      </Section>

      {/* Severity threshold */}
      <Section
        title="Severity threshold"
        desc="Hide findings below this level. Higher thresholds keep PRs cleaner but may miss nuance."
      >
        <div className="space-y-2">
          {SEVERITY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                minSeverity === opt.value
                  ? "border-primary/50 bg-primary/5"
                  : "border-border/60 hover:bg-accent/20"
              }`}
            >
              <input
                type="radio"
                name="severity"
                value={opt.value}
                checked={minSeverity === opt.value}
                onChange={() => setMinSeverity(opt.value)}
                className="mt-0.5 cursor-pointer accent-violet-500"
              />
              <div>
                <div className="text-sm font-medium">{opt.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </Section>

      {/* Skip paths */}
      <Section
        title="Skip paths"
        desc="Glob patterns to exclude from review. Useful for lockfiles, generated code, and migrations."
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkipPath())}
            placeholder="e.g. package-lock.json, *.lock, migrations/**"
            className="flex-1 bg-card/40 border border-border/60 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <Button onClick={addSkipPath} size="default" variant="outline">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        {skipPaths.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {skipPaths.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/60 bg-card/40 text-xs font-mono"
              >
                {p}
                <button
                  onClick={() => removeSkipPath(p)}
                  className="text-muted-foreground hover:text-red-400 transition"
                  aria-label={`Remove ${p}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </Section>

      {/* Extra prompt */}
      <Section
        title="Custom guidance"
        desc="Free-form instructions sent to the AI on every review of this repo. Mention domain quirks, banned patterns, or framework conventions."
      >
        <textarea
          value={extraPrompt}
          onChange={(e) => setExtraPrompt(e.target.value)}
          rows={5}
          maxLength={4000}
          placeholder="e.g. We use SQLAlchemy 2.x style queries. Flag any usage of the legacy Query API."
          className="w-full bg-card/40 border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {extraPrompt.length} / 4000
        </p>
      </Section>

      {/* Save */}
      <div className="flex justify-end pt-4 border-t border-border/40">
        <Button onClick={save} disabled={pending} variant="glow" size="lg">
          <Save className="h-4 w-4" />
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </div>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{desc}</p>
      {children}
    </section>
  );
}
