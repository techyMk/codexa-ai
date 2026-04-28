import Link from "next/link";
import { Github } from "lucide-react";
import { Logo } from "@/components/brand";
import { GITHUB_REPO_URL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-10 mt-12">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/" aria-label="Codexa home">
            <Logo width={120} />
          </Link>
          <span className="hidden sm:inline-block h-4 w-px bg-border/60" />
          <span>
            Designed and developed by{" "}
            <Link
              href="https://techymk.vercel.app/"
              target="_blank"
              rel="noopener"
              className="text-foreground font-medium hover:underline underline-offset-4"
            >
              techyMk
            </Link>
          </span>
        </div>

        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link href="/docs" className="hover:text-foreground transition-colors">
            Docs
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
            className="hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
