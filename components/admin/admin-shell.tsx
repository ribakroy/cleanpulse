import Link from "next/link";
import type { ReactNode } from "react";
import { Droplets, LogOut } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatRoleLabel } from "@/lib/auth/permissions";
import type { SafeUserRecord } from "@/lib/data/types";

type AdminShellProps = {
  children: ReactNode;
  user: SafeUserRecord;
  organizationName: string;
};

export function AdminShell({ children, user, organizationName }: AdminShellProps) {
  return (
    <div className="section-space">
      <div className="container-shell grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="surface-panel h-fit rounded-[var(--radius-lg)] overflow-hidden">
          {/* Brand / Logo */}
          <div className="px-5 pt-5 pb-4 border-b border-border">
            <Link
              href="/"
              className="group flex items-center gap-3 rounded-[var(--radius-md)] p-2 -mx-2 hover:bg-white/60 transition-colors"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand shadow-[0_6px_18px_rgba(30,136,229,0.3)]">
                <Droplets className="size-4 text-white" aria-hidden="true" />
              </span>
              <div className="leading-tight">
                <span className="block text-sm font-bold text-foreground">CleanPulse</span>
                <span className="block text-xs text-muted">ניהול ניקיון</span>
              </div>
            </Link>
          </div>

          {/* User info */}
          <div className="px-5 py-4 border-b border-border bg-brand-soft/40">
            <p className="text-sm font-bold text-foreground truncate">{user.fullName}</p>
            <p className="text-xs text-muted truncate">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-[11px]">
                {formatRoleLabel(user.role)}
              </Badge>
              <Badge variant="outline" className="text-[11px] truncate max-w-[130px]">
                {organizationName}
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-3 py-3">
            <AdminNav user={user} />
          </div>

          {/* Logout footer */}
          <div className="border-t border-border px-5 py-4">
            <Link
              href="/logout"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
              style={{ width: "100%", justifyContent: "flex-start" }}
            >
              <LogOut className="size-4" aria-hidden="true" />
              יציאה מהמערכת
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 space-y-6">{children}</main>
      </div>
    </div>
  );
}
