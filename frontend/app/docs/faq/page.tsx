import type { Metadata } from "next";
import Link from "next/link";
import { DocHeader, H2, P } from "@/components/docs/docs-content";

export const metadata: Metadata = { title: "FAQ" };

export default function Page() {
  return (
    <>
      <DocHeader
        eyebrow="Reference"
        title="Frequently asked questions"
        summary="Quick answers to common questions about pricing, limits, and behavior."
      />

      <H2>Is Codexa really free?</H2>
      <P>
        Yes. The hosted version uses only free AI provider tiers (Gemini, Groq) which is enough
        for ~1,500 reviews per day across all users on the shared instance. If you outgrow that,
        either bring your own key (
        <Link href="/docs/byok" className="text-primary hover:underline">BYOK</Link>) or self-host.
      </P>

      <H2>What languages does Codexa support?</H2>
      <P>
        Anything the underlying LLMs understand — which is essentially every mainstream language
        (Python, TypeScript, JavaScript, Go, Rust, Java, C#, Ruby, PHP, C/C++, Swift, Kotlin,
        Scala, etc.) and most config languages (YAML, TOML, JSON, Dockerfile, SQL). Codexa
        doesn&apos;t parse syntax — it reads the diff as text — so it works on any source file.
      </P>

      <H2>How big a PR can Codexa review?</H2>
      <P>
        Diffs are capped at 60 KB before being sent to the AI. Larger PRs get truncated with a
        marker. This is a free-tier safety limit; on self-host you can raise it by editing{" "}
        <code className="font-mono">backend/app/services/ai/prompt.py</code>.
      </P>

      <H2>How long does a review take?</H2>
      <P>
        Typically 6–12 seconds end-to-end. Groq&apos;s Llama 3.3 returns in ~3 seconds; the
        remaining time is GitHub API round-trips and Supabase writes.
      </P>

      <H2>Will Codexa block my merge?</H2>
      <P>
        Only if you configure it to. By default, Codexa posts a check run that&apos;s either
        successful (if no error-severity findings) or failed (otherwise). Whether that{" "}
        <em>blocks</em> the merge depends on your branch protection settings — add the &quot;Codexa
        AI Review&quot; check as a required status check to enforce it.
      </P>

      <H2>Does Codexa store my code?</H2>
      <P>
        No. The PR diff is sent to the AI provider in real time and discarded immediately. Only
        the AI&apos;s summary and findings (file paths, line numbers, messages) are stored in our
        Supabase database.
      </P>

      <H2>Can I use Codexa on private repos?</H2>
      <P>
        Yes. The GitHub App requires only the permissions it needs — <em>read</em> access to
        contents and <em>read/write</em> access to pull requests. It works identically on public
        and private repos.
      </P>

      <H2>What happens if I uninstall the bot?</H2>
      <P>
        Codexa loses access to that repo immediately. No more reviews fire. Existing review
        records remain in the database (visible on the dashboard) — you can request deletion via
        the GitHub repo if you want them purged.
      </P>

      <H2>I want to contribute / report a bug</H2>
      <P>
        Codexa is open source. Open an issue or PR on{" "}
        <Link href="/docs" className="text-primary hover:underline">
          the GitHub repo
        </Link>
        . Issues and pull requests are welcome.
      </P>
    </>
  );
}
