import Link from "next/link";
import type { ReactNode } from "react";
import { Droplets, LogOut, ShieldAlert } from "lucide-react";
import { SuperNav } from "@/components/super/super-nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { SafeUserRecord } from "@/lib/data/types";

type SuperShellProps = {
  children: ReactNode;
  user: SafeUserRecord;
};

export function SuperShell({ children, user }: SuperShellProps) {
  return (
    <div className="section-space min-h-screen">
      <div className="container-shell grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="surface-panel h-fit overflow-hidden rounded-[var(--radius-lg)]">
          <div className="px-5 pt-5 pb-4 border-b border-border">
            <Link
              href="/super/dashboard"
              className="group flex items-center gap-3 rounded-[var(--radius-md)] p-2 -mx-2 hover:bg-white/70 transition-colors"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand shadow-[0_6px_18px_rgba(30,136,229,0.3)]">
                <Droplets className="size-4 text-white" aria-hidden="true" />
              </span>
              <div className="leading-tight">
                <span className="block text-sm font-bold text-foreground">CleanPulse</span>
                <span className="block text-xs text-muted">ניהול בעלים</span>
              </div>
            </Link>
          </div>

          <div className="px-5 py-4 border-b border-border bg-brand-soft/35">
            <p className="text-sm font-bold text-foreground truncate">{user.fullName}</p>
            <p className="text-xs text-muted truncate">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-[11px]">
                <ShieldAlert className="size-3 ml-1 text-brand" />
                מנהל על
              </Badge>
            </div>
          </div>

          <div className="px-3 py-3">
            <SuperNav />
          </div>

          <div className="border-t border-border px-5 py-4">
            <a
              href="/logout"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
              style={{ width: "100%", justifyContent: "flex-start" }}
            >
              <LogOut className="size-4" aria-hidden="true" />
              יציאה מהמערכת
            </a>
          </div>
        </aside>

        <main className="min-w-0 space-y-6">{children}</main>
      </div>
    </div>
  );
}
