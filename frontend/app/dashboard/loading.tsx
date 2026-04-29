import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <div className="h-9 w-48 rounded bg-muted/50 animate-pulse" />
        <div className="mt-2 h-4 w-72 rounded bg-muted/40 animate-pulse" />
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-24 rounded bg-muted/50 animate-pulse" />
              <div className="h-4 w-4 rounded bg-muted/50 animate-pulse" />
            </div>
            <div className="h-9 w-20 rounded bg-muted/50 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60 flex items-center gap-3">
          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          <span className="text-sm text-muted-foreground">Loading recent reviews…</span>
        </div>
        <ul className="divide-y divide-border/40">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-muted/50 animate-pulse" />
                  <div className="h-3 w-5/6 rounded bg-muted/40 animate-pulse" />
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="h-5 w-16 rounded-md bg-muted/50 animate-pulse" />
                  <div className="h-3 w-12 rounded bg-muted/40 animate-pulse" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
