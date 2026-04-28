import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, Server, Settings, Code2, Zap, Shield } from "lucide-react";
import { DocHeader, P } from "@/components/docs/docs-content";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Everything you need to install, configure, and self-host Codexa.",
};

const CARDS = [
  {
    href: "/docs/install",
    icon: Sparkles,
    title: "Install the bot",
    desc: "Add Codexa to your repos in 60 seconds.",
  },
  {
    href: "/docs/self-host",
    icon: Server,
    title: "Self-host",
    desc: "Run Codexa on your own infrastructure with your own keys.",
  },
  {
    href: "/docs/settings",
    icon: Settings,
    title: "Per-repo settings",
    desc: "Skip paths, severity threshold, custom AI guidance.",
  },
  {
    href: "/docs/api",
    icon: Code2,
    title: "API reference",
    desc: "REST endpoints for the dashboard and integrations.",
  },
  {
    href: "/docs/byok",
    icon: Shield,
    title: "Bring your own key",
    desc: "Use your own AI provider key — your code stays private.",
  },
  {
    href: "/docs/faq",
    icon: Zap,
    title: "FAQ",
    desc: "Common questions about pricing, limits, and behavior.",
  },
];

export default function Page() {
  return (
    <>
      <DocHeader
        eyebrow="Documentation"
        title="Codexa Docs"
        summary="Everything you need to install Codexa, configure reviews, and run it on your own infrastructure."
      />

      <P className="mt-6">
        Codexa is an AI code review bot for GitHub pull requests. It catches bugs, security issues,
        and bad patterns before merge — and posts findings as a single review comment with file,
        line, severity, and concrete fix suggestions.
      </P>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-xl border border-border/60 bg-card/40 backdrop-blur p-5 hover:bg-card/60 hover:border-border transition"
          >
            <div className="flex items-center justify-between mb-3">
              <c.icon className="h-5 w-5 text-violet-400" />
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
            <h3 className="font-semibold mb-1">{c.title}</h3>
            <p className="text-sm text-muted-foreground">{c.desc}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
