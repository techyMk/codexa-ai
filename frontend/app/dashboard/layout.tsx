import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { createClient } from "@/lib/supabase/server";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const avatar = (user.user_metadata?.avatar_url as string | undefined) ?? "";
  const name = (user.user_metadata?.user_name as string | undefined)
    ?? (user.user_metadata?.full_name as string | undefined)
    ?? user.email
    ?? "you";

  return (
    <div className="min-h-screen flex">
      {/* Sidebar — sticks to viewport so nav is always reachable */}
      <aside className="w-64 flex-shrink-0 border-r border-border/40 bg-card/20 backdrop-blur-xl hidden md:flex flex-col sticky top-0 h-screen self-start">
        <div className="px-6 py-5">
          <Link href="/" className="flex items-center" aria-label="Codexa home">
            <Logo width={150} priority />
          </Link>
        </div>

        <nav className="px-3 flex-1 space-y-1">
          <SidebarNav />
        </nav>

        <div className="p-3 border-t border-border/40">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            {avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="h-8 w-8 rounded-full" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

