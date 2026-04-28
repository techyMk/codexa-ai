import { cn } from "@/lib/utils";

export function DocHeader({ eyebrow, title, summary }: { eyebrow: string; title: string; summary: string }) {
  return (
    <header className="pb-6 border-b border-border/40">
      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
        {eyebrow}
      </p>
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed text-balance">{summary}</p>
    </header>
  );
}

export function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="text-2xl font-semibold tracking-tight mt-10 mb-3 scroll-mt-24">
      {children}
    </h2>
  );
}

export function H3({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h3 id={id} className="text-lg font-semibold mt-6 mb-2 scroll-mt-24">
      {children}
    </h3>
  );
}

export function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-muted-foreground leading-relaxed", className)}>{children}</p>
  );
}

export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm text-foreground">
      {children}
    </code>
  );
}

export function Pre({ children, lang }: { children: React.ReactNode; lang?: string }) {
  return (
    <pre className="rounded-xl border border-border/60 bg-card/40 backdrop-blur p-4 overflow-x-auto text-sm font-mono text-foreground/90 my-4">
      {lang && (
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          {lang}
        </div>
      )}
      <code className="block whitespace-pre">{children}</code>
    </pre>
  );
}

export function Callout({
  variant = "info",
  children,
  title,
}: {
  variant?: "info" | "warn" | "tip";
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-blue-500/30 bg-blue-500/5",
    warn: "border-amber-500/30 bg-amber-500/5",
    tip: "border-emerald-500/30 bg-emerald-500/5",
  }[variant];
  const emoji = { info: "ℹ️", warn: "⚠️", tip: "💡" }[variant];
  return (
    <div className={`rounded-xl border ${styles} p-4 my-4`}>
      {title && (
        <div className="font-semibold text-foreground mb-1.5">
          {emoji} {title}
        </div>
      )}
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

export function ApiRow({
  method,
  path,
  desc,
}: {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  desc: string;
}) {
  const colors = {
    GET: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    POST: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    PUT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
  }[method];
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 items-start py-3 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${colors}`}>
          {method}
        </span>
        <code className="text-sm font-mono text-foreground">{path}</code>
      </div>
      <p className="text-sm text-muted-foreground col-span-2 mt-1">{desc}</p>
    </div>
  );
}
