import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listOrganizations } from "@/lib/data/repositories/organizations";
import { getDataAdapter } from "@/lib/data/get-data-adapter";
import type { ScreenRecord, BranchRecord, IncidentRecord } from "@/lib/data/types";

export const revalidate = 0; // Dynamic

function getNowTime() {
  return new Date().getTime();
}

export default async function SuperUsagePage() {
  const adapter = getDataAdapter();

  const [organizations, screens, branches, incidents] = await Promise.all([
    listOrganizations(),
    adapter.list("screens", { includeInactive: true }) as Promise<ScreenRecord[]>,
    adapter.list("branches", { includeInactive: true }) as Promise<BranchRecord[]>,
    adapter.list("incidents", { includeInactive: true }) as Promise<IncidentRecord[]>,
  ]);

  const now = getNowTime();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  // 1. Screens not seen recently (lastSeenAt missing or older than 24 hours)
  const inactiveScreens = screens.filter(
    (s) => s.isActive && (!s.lastSeenAt || new Date(s.lastSeenAt).getTime() < oneDayAgo)
  ).map((s) => {
    const org = organizations.find((o) => o.id === s.organizationId);
    const branch = branches.find((b) => b.id === s.branchId);
    return {
      screen: s,
      orgName: org?.name || "עסק לא ידוע",
      branchName: branch?.name || "סניף לא ידוע",
    };
  });

  // 2. Metrics calculation per organization
  const usageStats = organizations.map((org) => {
    const orgIncidents = incidents.filter((i) => i.organizationId === org.id);
    const orgScreens = screens.filter((s) => s.organizationId === org.id && s.isActive);
    const orgBranches = branches.filter((b) => b.organizationId === org.id && b.isActive);

    const incidentsToday = orgIncidents.filter((i) => new Date(i.createdAt).getTime() >= (now - 24 * 60 * 60 * 1000)).length;
    const incidents7Days = orgIncidents.filter((i) => new Date(i.createdAt).getTime() >= sevenDaysAgo).length;
    const incidents30Days = orgIncidents.filter((i) => new Date(i.createdAt).getTime() >= thirtyDaysAgo).length;

    // Detect high activity and low activity
    let alertType: "none" | "high" | "low" = "none";
    if (incidents7Days > 50) {
      alertType = "high";
    } else if (orgIncidents.length > 0 && incidents30Days === 0) {
      alertType = "low";
    }

    return {
      org,
      screensCount: orgScreens.length,
      branchesCount: orgBranches.length,
      incidentsToday,
      incidents7Days,
      incidents30Days,
      alertType,
    };
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">מדדי שימוש ופעילות</h1>
        <p className="text-sm text-muted mt-1">
          מי משתמש, מי לא, ואיפה כדאי לבדוק.
        </p>
      </div>

      {/* Grid Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Statistics Cards on Left (1 Column) */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <AlertTriangle className="size-5 text-danger" />
                מסכים לא מקוונים
              </CardTitle>
              <CardDescription>
                מסכים שלא נראו פעילים ב-24 השעות האחרונות.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {inactiveScreens.length === 0 ? (
                <div className="text-center py-6 text-muted text-sm">
                  כל המסכים מחוברים ותקינים.
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[400px] overflow-y-auto px-5">
                  {inactiveScreens.map(({ screen, orgName, branchName }) => (
                    <div key={screen.id} className="py-3 flex flex-col gap-1">
                      <div className="font-semibold text-foreground text-sm">{screen.name}</div>
                      <div className="text-xs text-muted">
                        {orgName} | {branchName}
                      </div>
                      <div className="text-[10px] text-danger flex items-center gap-1 mt-1 font-semibold">
                        <Clock className="size-3" />
                        נראה לאחרונה: {screen.lastSeenAt ? new Date(screen.lastSeenAt).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" }) : "מעולם לא"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Big Table on Right (2 Columns) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">מדדי שימוש ודיווחים לפי עסק</CardTitle>
              <CardDescription>
                פעילות לפי לקוח.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead>
                    <tr className="border-b border-border bg-brand-soft/30 text-muted font-semibold text-xs uppercase tracking-wider">
                      <th className="py-3 px-5">שם עסק</th>
                      <th className="py-3">מסכים / סניפים</th>
                      <th className="py-3">דיווחים היום</th>
                      <th className="py-3">דיווחים (7 ימים)</th>
                      <th className="py-3">דיווחים (30 יום)</th>
                      <th className="py-3 pl-5 text-center">הערת פעילות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-foreground">
                    {usageStats.map(({ org, screensCount, branchesCount, incidentsToday, incidents7Days, incidents30Days, alertType }) => (
                      <tr key={org.id} className="hover:bg-brand-soft/30 transition-colors">
                        <td className="py-4 px-5 font-bold text-foreground">
                          <Link href={`/super/organizations/${org.id}`} className="hover:text-brand transition-colors">
                            {org.name}
                          </Link>
                        </td>
                        <td className="py-4">
                          {screensCount} מסכים | {branchesCount} סניפים
                        </td>
                        <td className="py-4 font-semibold text-foreground">{incidentsToday}</td>
                        <td className="py-4 font-semibold text-foreground">{incidents7Days}</td>
                        <td className="py-4 font-semibold text-foreground">{incidents30Days}</td>
                        <td className="py-4 pl-5 text-center">
                          {alertType === "high" ? (
                            <Badge variant="danger">
                              פעילות גבוהה מאוד
                            </Badge>
                          ) : alertType === "low" ? (
                            <Badge variant="warning">
                              ללא שימוש (30 יום)
                            </Badge>
                          ) : (
                            <Badge variant="neutral">
                              תקין
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
