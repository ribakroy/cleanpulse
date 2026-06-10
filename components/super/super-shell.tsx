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
    <div className="section-space min-h-screen bg-slate-50/50">
      <div className="container-shell grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="h-fit rounded-[var(--radius-lg)] overflow-hidden bg-slate-900 text-white shadow-xl">
          {/* Brand / Logo */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-800">
            <Link
              href="/super/dashboard"
              className="group flex items-center gap-3 rounded-[var(--radius-md)] p-2 -mx-2 hover:bg-slate-800 transition-colors"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500 shadow-[0_6px_18px_rgba(56,189,248,0.3)]">
                <Droplets className="size-4 text-white" aria-hidden="true" />
              </span>
              <div className="leading-tight">
                <span className="block text-sm font-bold text-white tracking-wide">CleanPulse</span>
                <span className="block text-[10px] text-sky-400 font-semibold tracking-wider uppercase">Owner Console</span>
              </div>
            </Link>
          </div>

          {/* User info */}
          <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40">
            <p className="text-sm font-bold text-white truncate">{user.fullName}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge className="bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-[11px] border border-sky-500/20">
                <ShieldAlert className="size-3 ml-1 text-sky-400" />
                מנהל על
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-3 py-3">
            <SuperNav />
          </div>

          {/* Logout footer */}
          <div className="border-t border-slate-800 px-5 py-4">
            <a
              href="/logout"
              className={`${buttonVariants({ variant: "ghost", size: "sm" })} w-full !justify-start !text-slate-400 hover:!text-white transition-colors`}
            >
              <LogOut className="size-4 ml-2" aria-hidden="true" />
              יציאה מהמערכת
            </a>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 space-y-6">{children}</main>
      </div>
    </div>
  );
}
