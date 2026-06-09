import Link from "next/link";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { NoAccessState } from "@/components/admin/no-access-state";
import { getOrganizationById } from "@/lib/data/repositories/organizations";
import { requireUser } from "@/lib/auth/session";
import { buttonVariants } from "@/components/ui/button";

export default async function AdminAreaLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const organization = await getOrganizationById(user.organizationId);

  if (!user.isActive || !organization?.isActive) {
    return (
      <div className="container-shell section-space">
        <NoAccessState
          title="אין הרשאה למערכת"
          description="החשבון או הארגון שלך אינם פעילים כרגע. יש לפנות למנהל המערכת."
        />
        <div className="mt-4 flex justify-center">
          <Link href="/logout" className={buttonVariants({ variant: "outline", size: "sm" })}>
            יציאה מהמערכת
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminShell user={user} organizationName={organization.name}>
      {children}
    </AdminShell>
  );
}
