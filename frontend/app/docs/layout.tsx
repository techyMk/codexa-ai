import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";

const NAV = [
  {
    title: "Getting started",
    items: [
      { name: "Introduction", href: "/docs" },
      { name: "Install the bot", href: "/docs/install" },
      { name: "Self-hosting", href: "/docs/self-host" },
    ],
  },
  {
    title: "Configuration",
    items: [
      { name: "Per-repo settings", href: "/docs/settings" },
      { name: "Bring your own key", href: "/docs/byok" },
    ],
  },
  {
    title: "Reference",
    items: [
      { name: "API reference", href: "/docs/api" },
      { name: "Webhook events", href: "/docs/webhooks" },
      { name: "FAQ", href: "/docs/faq" },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navbar />

      <div className="container max-w-7xl pt-28 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="space-y-6 text-sm">
              {NAV.map((section) => (
                <div key={section.title}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    {section.title}
                  </h4>
                  <ul className="space-y-1">
                    {section.items.map((it) => (
                      <li key={it.href}>
                        <Link
                          href={it.href}
                          className="block px-3 py-1.5 rounded-md text-muted-foreground hover:bg-accent/30 hover:text-foreground transition-colors"
                        >
                          {it.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <article className="min-w-0 space-y-6">{children}</article>
        </div>
      </div>

      <Footer />
    </main>
  );
}
