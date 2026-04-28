import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DocHeader, H2, P, Pre, Callout } from "@/components/docs/docs-content";
import { INSTALL_URL } from "@/lib/constants";

export const metadata: Metadata = { title: "Install the bot" };

export default function Page() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="Install Codexa"
        summary="Add Codexa to one of your GitHub repos. The next PR you open gets a review automatically."
      />

      <H2>1. Install on your repository</H2>
      <P>
        Click the button below. GitHub will ask which account and which repos to install Codexa on.
        Pick &quot;Only select repositories&quot; if you want to start with just one.
      </P>

      <Link
        href={INSTALL_URL}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-blue-600 to-violet-600 bg-[length:200%_auto] text-white font-medium shadow-xl shadow-violet-500/30 hover:bg-[position:right_center] hover:-translate-y-0.5 transition-all"
      >
        Install on GitHub <ArrowRight className="h-4 w-4" />
      </Link>

      <H2>2. Open a pull request</H2>
      <P>
        That&apos;s it. The next PR you open in an installed repo gets a review within ~10 seconds.
        Codexa posts a single comment with all findings, ranked by severity.
      </P>

      <Callout variant="tip" title="Quick test">
        Want to see Codexa work right away? Make a tiny commit on a new branch and open a PR with
        intentionally rough code (a missing null check, a hardcoded secret, a SQL injection).
        Codexa will surface every issue in the comment.
      </Callout>

      <H2>3. (Optional) Sign in to the dashboard</H2>
      <P>
        Visit{" "}
        <Link href="/login" className="text-primary hover:underline">
          the dashboard
        </Link>{" "}
        and sign in with GitHub to see review history, configure per-repo settings, and view
        full finding detail.
      </P>

      <H2>What permissions does Codexa need?</H2>
      <P>The GitHub App requests these permissions on the repos you install it on:</P>
      <Pre>{`Pull requests:  Read and write    (read diffs, post review comments)
Contents:       Read-only          (fetch the diff)
Metadata:       Read-only          (auto, granted to all GitHub Apps)
Checks:         Read and write     (post a status check on each PR)`}</Pre>
      <P>
        Codexa never modifies your repository contents, branches, settings, or anything else. You
        can revoke access at any time by uninstalling the App from GitHub settings.
      </P>

      <H2>Next steps</H2>
      <ul className="space-y-2 mt-3">
        <li>
          <Link href="/docs/settings" className="text-primary hover:underline">
            Configure per-repo settings →
          </Link>
        </li>
        <li>
          <Link href="/docs/self-host" className="text-primary hover:underline">
            Self-host on your own infrastructure →
          </Link>
        </li>
        <li>
          <Link href="/docs/api" className="text-primary hover:underline">
            Browse the API reference →
          </Link>
        </li>
      </ul>
    </>
  );
}
