"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitPullRequest,
  CheckCircle2,
  Sliders,
  Search,
  ChevronsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AUTO_ADVANCE_MS = 6000;

const TABS = [
  {
    id: "pr",
    label: "PR Comment",
    icon: GitPullRequest,
    desc: "A single, well-formatted comment on every PR — summary, severity-tagged findings, file:line refs, and concrete fix suggestions.",
    image: "/screenshots/pr-comment.png",
    url: "github.com/your-org/repo/pull/12",
    width: 1920,
    height: 900,
  },
  {
    id: "check",
    label: "Status Check",
    icon: CheckCircle2,
    desc: "Codexa posts a real GitHub status check. Add it to branch protection to block merges with critical issues.",
    image: "/screenshots/github-check.png",
    url: "github.com/your-org/repo/pull/12/checks",
    width: 1920,
    height: 900,
  },
  {
    id: "settings",
    label: "Per-repo Settings",
    icon: Sliders,
    desc: "Tune Codexa for each repo — skip lockfiles, set a severity threshold, and add custom guidance the AI must follow.",
    image: "/screenshots/repo-settings.png",
    url: "codexa.dev/dashboard/settings/repos/...",
    width: 1906,
    height: 1491,
  },
  {
    id: "detail",
    label: "Finding Detail",
    icon: Search,
    desc: "Click any review to drill into the full breakdown — every finding with file, line, message, and AI-suggested fix.",
    image: "/screenshots/review-detail.png",
    url: "codexa.dev/dashboard/reviews/...",
    width: 1920,
    height: 900,
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

const FRAME_ASPECT = 1920 / 900;

export function Showcase() {
  const [active, setActive] = useState<TabId>(TABS[0].id);
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const current = TABS.find((t) => t.id === active)!;
  const isScrollable = current.height / current.width > 1 / FRAME_ASPECT;

  // Auto-advance — pauses on hover, resets on manual click
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => {
      const i = TABS.findIndex((t) => t.id === active);
      const next = TABS[(i + 1) % TABS.length].id;
      setActive(next);
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [active, paused]);

  // Reset scroll position when tab changes
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [active]);

  return (
    <section className="py-24 relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 h-72 w-72 rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            See Codexa <span className="gradient-text">in action.</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
            From the PR comment to the dashboard — every surface where Codexa shows up.
          </p>
        </motion.div>

        {/* Tab pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {TABS.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300",
                  isActive
                    ? "border-primary/50 bg-primary/10 text-foreground shadow-lg shadow-primary/20"
                    : "border-border/50 bg-card/30 text-muted-foreground hover:text-foreground hover:bg-card/60 hover:border-border",
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Browser chrome */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Glow halo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            aria-hidden
            className="absolute -inset-4 bg-gradient-to-r from-violet-500/30 via-blue-500/30 to-violet-500/30 blur-3xl rounded-3xl opacity-50"
          />

          <div className="relative rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* macOS-style browser chrome */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-card/80">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.url}
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 2 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 max-w-md mx-auto px-3 py-1 rounded-md bg-background/60 border border-border/40 text-xs text-muted-foreground font-mono text-center truncate"
                >
                  {current.url}
                </motion.div>
              </AnimatePresence>
              <div className="w-12" />
            </div>

            {/* Auto-advance progress bar */}
            <div className="relative h-[2px] bg-border/30 overflow-hidden">
              <div
                key={`progress-${active}-${paused}`}
                className={cn(
                  "absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-blue-500",
                  paused ? "" : "animate-[progress_6000ms_linear_forwards]",
                )}
                style={{
                  animationPlayState: paused ? "paused" : "running",
                }}
              />
            </div>

            {/* Fixed-aspect viewport — scrolls vertically when image is taller */}
            <div
              className="relative bg-background/40"
              style={{ aspectRatio: FRAME_ASPECT }}
            >
              <div
                ref={scrollRef}
                className="absolute inset-0 overflow-y-auto showcase-scroll"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, scale: 1.01 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <Image
                      src={current.image}
                      alt={`${current.label} screenshot`}
                      width={current.width}
                      height={current.height}
                      sizes="(min-width: 1280px) 1152px, 100vw"
                      className="block w-full h-auto"
                      priority={active === TABS[0].id}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Scroll hint — only shown for scrollable tabs, fades after a moment */}
              {isScrollable && (
                <motion.div
                  key={`hint-${active}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none"
                >
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/80 backdrop-blur border border-border/60 text-xs text-muted-foreground shadow-lg">
                    <ChevronsDown className="h-3 w-3 animate-bounce" />
                    Scroll for more
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Description fades between tabs */}
        <div className="mt-8 max-w-2xl mx-auto h-12 relative">
          <AnimatePresence mode="wait">
            <motion.p
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 text-center text-muted-foreground"
            >
              {current.desc}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
