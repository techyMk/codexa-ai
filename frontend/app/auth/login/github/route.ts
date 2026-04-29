import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/dashboard";

  // Fire-and-forget warm-up ping so Render's free tier wakes up while the
  // user is still on GitHub's authorize screen.
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backend) {
    fetch(`${backend}/healthz`, {
      cache: "no-store",
      // Don't let a slow ping block the OAuth redirect.
      signal: AbortSignal.timeout(2_000),
    }).catch(() => {});
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      scopes: "read:user user:email",
    },
  });

  if (error || !data?.url) {
    const msg = encodeURIComponent(error?.message ?? "auth_failed");
    return NextResponse.redirect(`${origin}/login?error=${msg}`);
  }

  return NextResponse.redirect(data.url);
}
