import type { Metadata } from "next";
import Link from "next/link";
import { DocHeader, H2, P, Pre, Callout } from "@/components/docs/docs-content";

export const metadata: Metadata = { title: "Bring your own key" };

export default function Page() {
  return (
    <>
      <DocHeader
        eyebrow="Configuration"
        title="Bring your own key (BYOK)"
        summary="Use your own AI provider key so your code never touches our servers."
      />

      <P>
        Codexa supports two ways to use your own AI keys:
      </P>

      <H2>Option 1 — self-host with your keys</H2>
      <P>
        The most private option. Run the entire backend on your own infrastructure, set{" "}
        <code className="font-mono">GEMINI_API_KEY</code> and/or{" "}
        <code className="font-mono">GROQ_API_KEY</code> in your environment, and your PR diffs only
        ever touch your servers + the AI provider you chose. See{" "}
        <Link href="/docs/self-host" className="text-primary hover:underline">
          self-hosting
        </Link>
        .
      </P>

      <H2>Option 2 — BYOK on the hosted version</H2>
      <P>
        <strong className="text-foreground">Coming soon.</strong> The dashboard will accept your
        own Gemini or Groq keys, encrypted at rest with a per-user envelope key. When you submit
        a PR, your key is used for that review — bypassing our shared rate limit.
      </P>

      <Callout variant="info" title="Status">
        BYOK on hosted is on the roadmap. Track progress on the GitHub repo. For now, self-host if
        you need full key isolation.
      </Callout>

      <H2>Get your keys</H2>
      <P>Both providers offer generous free tiers, no credit card required:</P>

      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
        <li>
          <strong className="text-foreground">Google Gemini</strong> —{" "}
          <Link
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener"
            className="text-primary hover:underline"
          >
            aistudio.google.com/app/apikey
          </Link>
          . 1,500 requests/day free on{" "}
          <code className="font-mono">gemini-2.0-flash</code>.
        </li>
        <li>
          <strong className="text-foreground">Groq</strong> —{" "}
          <Link
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener"
            className="text-primary hover:underline"
          >
            console.groq.com/keys
          </Link>
          . Free tier with{" "}
          <code className="font-mono">llama-3.3-70b-versatile</code>. ~500 tokens/sec — fastest
          inference around.
        </li>
      </ul>

      <H2>How Codexa picks a provider</H2>
      <P>
        At review time, Codexa tries providers in this order: Gemini → Groq. If the first is
        rate-limited or errors, the next steps in seamlessly. You only need <em>one</em> key to
        run the bot — both is recommended for resilience.
      </P>

      <Pre lang="example">{`# Single provider (Gemini only)
GEMINI_API_KEY=AIza...
# GROQ_API_KEY left blank

# Both — Gemini primary, Groq fallback
GEMINI_API_KEY=AIza...
GROQ_API_KEY=gsk_...`}</Pre>
    </>
  );
}
