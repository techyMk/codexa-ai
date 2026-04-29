"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export type DocsNavSection = {
  title: string;
  items: { name: string; href: string }[];
};

export function DocsMobileNav({ nav }: { nav: DocsNavSection[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Find the current page label so the trigger button shows where you are
  const current = nav.flatMap((s) => s.items).find((i) => i.href === pathname);

  return (
    <div className="lg:hidden mb-8">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Browse docs"
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border/60 bg-card/40 backdrop-blur hover:bg-card/60 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="h-4 w-4 text-violet-400 flex-shrink-0" />
          <span className="text-sm font-medium truncate">
            {current?.name ?? "Browse docs"}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <nav className="mt-2 p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur space-y-5">
              {nav.map((section) => (
                <div key={section.title}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    {section.title}
                  </h4>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "block px-3 py-2 rounded-md text-sm transition-colors",
                              isActive
                                ? "bg-accent/60 text-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
                            )}
                          >
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
