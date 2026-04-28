import type { Finding, Severity } from "@/app/dashboard/data";

const SEV_STYLES: Record<Severity, { bg: string; border: string; text: string; emoji: string }> = {
  error: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    emoji: "🔴",
  },
  warn: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    emoji: "🟡",
  },
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    emoji: "🔵",
  },
};

export function FindingCard({ finding }: { finding: Finding }) {
  const s = SEV_STYLES[finding.severity];
  return (
    <div className={`rounded-xl border p-4 ${s.bg} ${s.border}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-wide ${s.text}`}>
          {s.emoji} {finding.severity}
        </span>
        {finding.file && (
          <span className="text-xs font-mono text-muted-foreground truncate">
            {finding.file}
            {finding.line ? `:${finding.line}` : ""}
          </span>
        )}
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed">{finding.message}</p>
      {finding.suggestion && (
        <div className="mt-3 pt-3 border-t border-border/40">
          <span className="text-xs uppercase tracking-wide text-muted-foreground font-mono">
            💡 Suggestion
          </span>
          <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{finding.suggestion}</p>
        </div>
      )}
    </div>
  );
}
