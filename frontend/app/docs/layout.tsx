import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/landing/footer";
import { DocsSidebar } from "@/components/docs/sidebar";
import { DocsMobileNav, type DocsNavSection } from "@/components/docs/mobile-nav";

const NAV: DocsNavSection[] = [
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

      <div className="container max-w-7xl pt-32 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
          {/* Desktop sticky sidebar (hidden on mobile) */}
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <DocsSidebar nav={NAV} />
          </aside>

          <article className="min-w-0 space-y-6">
            {/* Mobile collapsible nav (hidden on desktop) */}
            <DocsMobileNav nav={NAV} />
            {children}
          </article>
        </div>
      </div>

      <Footer />
    </main>
  );
}
