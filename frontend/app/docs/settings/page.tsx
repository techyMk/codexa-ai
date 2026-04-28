import type { Metadata } from "next";
import Link from "next/link";
import { DocHeader, H2, P, Pre, Callout } from "@/components/docs/docs-content";

export const metadata: Metadata = { title: "Per-repo settings" };

export default function Page() {
  return (
    <>
      <DocHeader
        eyebrow="Configuration"
        title="Per-repository settings"
        summary="Customize how Codexa reviews each repo. Available at /dashboard/settings/repos after sign-in."
      />

      <H2>Skip paths</H2>
      <P>
        Glob patterns of files to exclude from review. Codexa strips matching files from the diff
        before sending to the AI — saves tokens and prevents noisy findings on auto-generated code.
      </P>
      <Pre lang="examples">{`package-lock.json
yarn.lock
*.lock
**/migrations/**
dist/**
*.generated.ts`}</Pre>
      <P>
        Patterns use shell-style globs (<code className="font-mono">fnmatch</code>) — not full
        regex. Use <code className="font-mono">**</code> to match any number of path segments.
      </P>

      <H2>Severity threshold</H2>
      <P>
        Hide findings below the chosen level. Three options:
      </P>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
        <li>
          <strong className="text-foreground">Info</strong> — surface every finding, including style suggestions
        </li>
        <li>
          <strong className="text-foreground">Warn</strong> — skip info-level; show warnings and errors only
        </li>
        <li>
          <strong className="text-foreground">Error</strong> — only block-worthy issues. Quietest setting.
        </li>
      </ul>
      <P>
        The threshold is applied <em>after</em> the AI generates findings — the prompt itself
        doesn&apos;t change. If you want the AI to actively look harder for serious issues, use the{" "}
        <strong className="text-foreground">Custom guidance</strong> field instead.
      </P>

      <H2>Custom guidance</H2>
      <P>
        Free-form instructions sent to the AI on every review of this repo. Use this for:
      </P>
      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
        <li>Framework conventions specific to your stack</li>
        <li>Banned patterns or libraries</li>
        <li>Domain quirks the AI couldn&apos;t infer from the diff alone</li>
        <li>Style guides you want enforced</li>
      </ul>

      <Callout variant="tip" title="Examples that work well">
        &quot;We use SQLAlchemy 2.x style. Flag any usage of the legacy{" "}
        <code className="font-mono">Query</code> API.&quot;
        <br />
        <br />
        &quot;This is a healthcare app. PHI must never appear in logs — flag any{" "}
        <code className="font-mono">log.info</code> that includes user fields.&quot;
        <br />
        <br />
        &quot;Skip nits about var naming. We have a separate linter for that.&quot;
      </Callout>

      <H2>Disabled toggle</H2>
      <P>
        Pause reviews on a repo without uninstalling Codexa. Useful when you&apos;re landing a huge
        refactor and don&apos;t want comment noise on every PR.
      </P>

      <H2>Where to configure</H2>
      <P>
        Sign in to{" "}
        <Link href="/dashboard/settings/repos" className="text-primary hover:underline">
          your dashboard
        </Link>{" "}
        → Settings → Per-repository settings → pick the repo. Settings save instantly and apply to
        the next PR review.
      </P>
    </>
  );
}
