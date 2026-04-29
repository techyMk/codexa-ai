"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { DocsNavSection } from "@/components/docs/mobile-nav";

export function DocsSidebar({ nav }: { nav: DocsNavSection[] }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-6 text-sm">
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
                      "block px-3 py-1.5 rounded-md transition-colors",
                      isActive
                        ? "bg-accent/60 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent/30 hover:text-foreground",
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
  );
}
