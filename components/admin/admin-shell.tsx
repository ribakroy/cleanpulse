import Link from "next/link";
import type { ReactNode } from "react";
import { Building2, Droplets, ShieldCheck } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatRoleLabel } from "@/lib/auth/permissions";
import type { SafeUserRecord } from "@/lib/data/types";
import { env } from "@/lib/utils/env";

type AdminShellProps = {
  children: ReactNode;
  user: SafeUserRecord;
  organizationName: string;
};

export function AdminShell({ children, user, organizationName }: AdminShellProps) {
  return (
    <div className="section-space">
      <div className="container-shell grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="surface-panel h-fit rounded-[var(--radius-lg)] p-4 sm:p-5">
          <Link href="/" className="mb-6 flex items-center gap-3 rounded-[var(--radius-md)] bg-white/70 p-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-brand-soft text-brand-deep">
              <Droplets className="size-5" aria-hidden="true" />
            </span>
            <span className="space-y-0.5">
              <span className="block text-sm font-semibold text-foreground">CleanPulse</span>
              <span className="block text-xs text-muted">לוח ניהול</span>
            </span>
          </Link>

          <div className="mb-5 rounded-[var(--radius-md)] border border-border bg-linear-to-br from-brand-soft to-white p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-brand-deep" aria-hidden="true" />
              <p className="text-sm font-semibold text-foreground">משתמש מחובר</p>
            </div>
            <p className="mt-3 text-base font-semibold text-foreground">{user.fullName}</p>
            <p className="mt-1 text-sm text-muted">{organizationName}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{formatRoleLabel(user.role)}</Badge>
              <Badge variant="outline">{user.email}</Badge>
            </div>
          </div>

          <AdminNav user={user} />
        </aside>

        <div className="space-y-6">
          <div className="surface-panel flex flex-col gap-3 rounded-[var(--radius-lg)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">מעטפת ניהול מאובטחת</p>
              <p className="text-sm leading-7 text-muted">
                כל הניווט הניהולי scoped לארגון של המשתמש המחובר בלבד, עם session ב־JWT cookie חתום.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                <Building2 className="size-3.5" aria-hidden="true" />
                {organizationName}
              </Badge>
              <Badge variant="secondary">DATA: {env.dataAdapter}</Badge>
              <Badge variant="outline">EMAIL: {env.emailProvider}</Badge>
              <Link href="/logout" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                יציאה
              </Link>
            </div>
          </div>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
