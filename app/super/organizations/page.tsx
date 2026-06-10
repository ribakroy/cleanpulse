import Link from "next/link";
import { Plus, Search, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { listOrganizations } from "@/lib/data/repositories/organizations";
import { getDataAdapter } from "@/lib/data/get-data-adapter";
import type { ScreenRecord, BranchRecord, IncidentRecord } from "@/lib/data/types";

export const revalidate = 0; // Dynamic

type SearchParams = Promise<{
  q?: string;
  status?: string;
  plan?: string;
}>;

const planLabels: Record<string, string> = {
  free: "חינמי",
  starter: "מתחיל",
  basic: "בסיסי",
  pro: "מקצועי",
  enterprise: "ארגוני",
  demo: "בדיקה",
};

function getNowTime() {
  return new Date().getTime();
}

export default async function SuperOrganizationsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const q = searchParams.q?.trim().toLowerCase() || "";
  const statusFilter = searchParams.status || "";
  const planFilter = searchParams.plan || "";

  const adapter = getDataAdapter();

  // Load all data
  const [organizations, screens, branches, incidents] = await Promise.all([
    listOrganizations(),
    adapter.list("screens", { includeInactive: true }) as Promise<ScreenRecord[]>,
    adapter.list("branches", { includeInactive: true }) as Promise<BranchRecord[]>,
    adapter.list("incidents", { includeInactive: true }) as Promise<IncidentRecord[]>,
  ]);

  // Aggregate statistics per organization
  const orgExtendedData = organizations.map((org) => {
    const orgScreens = screens.filter((s) => s.organizationId === org.id && s.isActive);
    const orgBranches = branches.filter((b) => b.organizationId === org.id && b.isActive);
    const orgIncidents = incidents.filter((i) => i.organizationId === org.id);

    // Incidents in last 30 days
    const thirtyDaysAgo = getNowTime() - 30 * 24 * 60 * 60 * 1000;
    const incidents30Days = orgIncidents.filter((i) => new Date(i.createdAt).getTime() >= thirtyDaysAgo).length;

    // Last activity date
    const sortedIncidents = [...orgIncidents].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const lastActivity = sortedIncidents[0]?.createdAt 
      ? new Date(sortedIncidents[0].createdAt).toLocaleDateString("he-IL", { timeZone: "Asia/Jerusalem" }) 
      : "אין פעילות";

    const computedStatus = org.status || (org.isActive ? "active" : "suspended");

    return {
      org,
      screensCount: orgScreens.length,
      branchesCount: orgBranches.length,
      incidents30Days,
      lastActivity,
      computedStatus,
    };
  });

  // Filter organizations
  const filteredOrgs = orgExtendedData.filter(({ org, computedStatus }) => {
    // Search query match
    if (q) {
      const nameMatch = org.name.toLowerCase().includes(q);
      const slugMatch = org.slug.toLowerCase().includes(q);
      const emailMatch = org.billingEmail?.toLowerCase().includes(q) || false;
      const contactMatch = org.contactName?.toLowerCase().includes(q) || false;
      if (!nameMatch && !slugMatch && !emailMatch && !contactMatch) {
        return false;
      }
    }

    // Status filter
    if (statusFilter && computedStatus !== statusFilter) {
      return false;
    }

    // Plan filter
    if (planFilter && org.plan !== planFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">ניהול לקוחות ועסקים</h1>
          <p className="text-sm text-muted mt-1">
            צפייה, חיפוש וניהול לקוחות.
          </p>
        </div>
        <div>
          <Link
            href="/super/organizations/new"
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            <Plus className="size-4 ml-1.5" />
            הקמת עסק חדש
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <form method="GET" action="/super/organizations" className="grid gap-4 sm:grid-cols-4 items-end">
            {/* Search Input */}
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="search" className="text-xs font-semibold text-muted block">חיפוש חופשי</label>
              <div className="relative">
                <Search className="absolute right-3 top-3 size-4 text-brand" />
                <input
                  id="search"
                  name="q"
                  type="text"
                  placeholder="חיפוש לפי שם עסק, איש קשר או אימייל..."
                  defaultValue={q}
                  className="w-full h-10 pr-9 pl-4 rounded-[var(--radius-md)] border border-border bg-white text-sm focus:outline-none focus:border-brand transition-colors"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-1">
              <label htmlFor="status" className="text-xs font-semibold text-muted block">סטטוס מנוי</label>
              <select
                id="status"
                name="status"
                defaultValue={statusFilter}
                className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-border bg-white text-sm focus:outline-none focus:border-brand transition-colors"
              >
                <option value="">הכל</option>
                <option value="active">פעיל</option>
                <option value="trial">תקופת ניסיון</option>
                <option value="suspended">מושעה</option>
                <option value="cancelled">מבוטל</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex gap-2">
              <button
                type="submit"
                className={buttonVariants({ variant: "primary", size: "md" })}
                style={{ width: "100%" }}
              >
                סינון תוצאות
              </button>
              <Link
                href="/super/organizations"
                className={buttonVariants({ variant: "outline", size: "md" })}
              >
                איפוס
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Organizations Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b border-border bg-brand-soft/50 text-muted font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-5">שם עסק</th>
                  <th className="py-3">איש קשר וטלפון</th>
                  <th className="py-3">תוכנית</th>
                  <th className="py-3">סטטוס מנוי</th>
                  <th className="py-3">מסכים / סניפים</th>
                  <th className="py-3">דיווחים (30 יום)</th>
                  <th className="py-3">פעילות אחרונה</th>
                  <th className="py-3 pl-5 text-center">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-muted">
                {filteredOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-muted/70">
                      לא נמצאו עסקים העונים לתנאי הסינון.
                    </td>
                  </tr>
                ) : (
                  filteredOrgs.map(({ org, screensCount, branchesCount, incidents30Days, lastActivity, computedStatus }) => (
                    <tr key={org.id} className="hover:bg-brand-soft/30 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-foreground">{org.name}</div>
                      </td>
                      <td className="py-4">
                        <div className="font-medium text-foreground">{org.contactName || "לא הוגדר"}</div>
                        <div className="text-xs text-muted mt-0.5">{org.contactPhone || org.billingEmail || ""}</div>
                      </td>
                      <td className="py-4">
                        <span className="capitalize font-semibold text-brand text-xs bg-brand-soft px-2.5 py-1 rounded-full border border-brand/10">
                          {planLabels[org.plan] || org.plan}
                        </span>
                      </td>
                      <td className="py-4">
                        <Badge
                          variant={
                            computedStatus === "active"
                              ? "success"
                              : computedStatus === "trial"
                              ? "secondary"
                              : computedStatus === "suspended"
                              ? "danger"
                              : "outline"
                          }
                        >
                          {computedStatus === "active"
                            ? "פעיל"
                            : computedStatus === "trial"
                            ? "תקופת ניסיון"
                            : computedStatus === "suspended"
                            ? "מושעה"
                            : computedStatus === "cancelled"
                            ? "מבוטל"
                            : "פעיל"}
                        </Badge>
                      </td>
                      <td className="py-4 font-medium">
                        {screensCount} מסכים / {branchesCount} סניפים
                        <div className="text-[10px] text-muted/70">עד {org.allowedScreensLimit ?? 5} מסכים</div>
                      </td>
                      <td className="py-4 font-semibold text-foreground">
                        {incidents30Days}
                      </td>
                      <td className="py-4 text-xs text-muted">
                        {lastActivity}
                      </td>
                      <td className="py-4 pl-5 text-center">
                        <Link
                          href={`/super/organizations/${org.id}`}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          <Eye className="size-3.5 ml-1" />
                          פרטים וניהול
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
