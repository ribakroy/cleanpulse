import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Building2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getOrganizationById } from "@/lib/data/repositories/organizations";
import { listUsersByOrganization } from "@/lib/data/repositories/users";
import { getDataAdapter } from "@/lib/data/get-data-adapter";
import { OrgDetailsClient } from "@/components/super/org-details-client";
import type { ScreenRecord, BranchRecord } from "@/lib/data/types";

export const revalidate = 0; // Dynamic

type Params = Promise<{ id: string }>;

export default async function SuperOrganizationDetailPage(props: { params: Params }) {
  const params = await props.params;
  const id = params.id;

  const org = await getOrganizationById(id);

  if (!org) {
    notFound();
  }

  const adapter = getDataAdapter();

  // Load related data
  const [users, orgScreens, orgBranches] = await Promise.all([
    listUsersByOrganization(org.id),
    adapter.query("screens", { organizationId: org.id }) as Promise<ScreenRecord[]>,
    adapter.query("branches", { organizationId: org.id }) as Promise<BranchRecord[]>,
  ]);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Back button and title header */}
      <div className="flex flex-col gap-3">
        <div>
          <Link
            href="/super/organizations"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            style={{ paddingRight: 0 }}
          >
            <ArrowRight className="size-4 ml-1.5" />
            חזרה לרשימת לקוחות
          </Link>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Building2 className="size-6" />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{org.name}</h1>
              <p className="text-sm text-muted mt-0.5">כרטיס לקוח</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main details manager client component */}
      <OrgDetailsClient
        org={org}
        users={users}
        screensCount={orgScreens.length}
        branchesCount={orgBranches.length}
      />
    </div>
  );
}
