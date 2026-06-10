import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Building2,
  Clock,
  Coins,
  Smartphone,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { listOrganizations } from "@/lib/data/repositories/organizations";
import { getDataAdapter } from "@/lib/data/get-data-adapter";
import type { IncidentRecord, ScreenRecord, BranchRecord, ActivityLogRecord } from "@/lib/data/types";

export const revalidate = 0; // Dynamic rendering

export default async function SuperDashboardPage() {
  const adapter = getDataAdapter();

  // Load all system data
  const [organizations, screens, branches, incidents, activityLogs] = await Promise.all([
    listOrganizations(),
    adapter.list("screens", { includeInactive: true }) as Promise<ScreenRecord[]>,
    adapter.list("branches", { includeInactive: true }) as Promise<BranchRecord[]>,
    adapter.list("incidents", { includeInactive: true }) as Promise<IncidentRecord[]>,
    adapter.list("activity_logs", { includeInactive: true }) as Promise<ActivityLogRecord[]>,
  ]);

  // Statistics calculation
  const totalOrgs = organizations.length;
  const activeOrgs = organizations.filter((o) => o.status === "active" || (!o.status && o.isActive)).length;
  const trialOrgs = organizations.filter((o) => o.status === "trial").length;
  const suspendedOrgs = organizations.filter((o) => o.status === "suspended").length;

  const totalScreens = screens.filter((s) => s.isActive).length;
  const totalBranches = branches.filter((b) => b.isActive).length;

  // Incident statistics
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

  const incidentsToday = incidents.filter((i) => new Date(i.createdAt).getTime() >= todayStart).length;
  const incidents7Days = incidents.filter((i) => new Date(i.createdAt).getTime() >= sevenDaysAgo).length;

  // Expected Monthly Revenue (MRR)
  const expectedMRR = organizations.reduce((acc, org) => {
    if (org.status === "suspended" || org.status === "cancelled") return acc;
    return acc + (org.monthlyPrice || 0);
  }, 0);

  // Identify organizations requiring attention
  const orgsRequiringAttention = organizations.map((org) => {
    const orgIncidents = incidents.filter((i) => i.organizationId === org.id);
    const orgScreens = screens.filter((s) => s.organizationId === org.id && s.isActive);
    const lastIncident = orgIncidents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    let reason = "";
    let level: "warning" | "danger" = "warning";

    if (org.status === "suspended") {
      reason = "העסק מושעה";
      level = "danger";
    } else if (orgScreens.length > (org.allowedScreensLimit ?? 5)) {
      reason = "חריגה ממגבלת המסכים";
      level = "danger";
    } else if (lastIncident && new Date(lastIncident.createdAt).getTime() < thirtyDaysAgo) {
      reason = "ללא פעילות מעל 30 יום";
      level = "warning";
    }

    return {
      org,
      reason,
      level,
      lastIncidentDate: lastIncident ? new Date(lastIncident.createdAt).toLocaleDateString("he-IL") : "אין דיווחים",
    };
  }).filter((x) => x.reason !== "");

  // Sort activity logs
  const sortedLogs = [...activityLogs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">מרכז השליטה</h1>
          <p className="text-sm text-slate-500 mt-1">
            סקירה כללית של פלטפורמת CleanPulse ונתוני לקוחות בזמן אמת.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/super/organizations/new"
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            <Building2 className="size-4 ml-1.5" />
            הקמת עסק חדש
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Orgs */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">סה&quot;כ עסקים במערכת</CardTitle>
            <Building2 className="size-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-950">{totalOrgs}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="text-emerald-600 font-semibold">{activeOrgs} פעילים</span>
              <span className="text-slate-300">|</span>
              <span className="text-amber-600 font-semibold">{trialOrgs} בניסיון</span>
              <span className="text-slate-300">|</span>
              <span className="text-rose-600 font-semibold">{suspendedOrgs} מושעים</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Active Screens */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">מסכים פעילים</CardTitle>
            <Smartphone className="size-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-950">{totalScreens}</div>
            <p className="text-xs text-slate-500 mt-1">בפריסה של {totalBranches} סניפים פעילים</p>
          </CardContent>
        </Card>

        {/* Expected MRR */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">צפי הכנסות חודשי (MRR)</CardTitle>
            <Coins className="size-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-950">
              {new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(expectedMRR)}
            </div>
            <p className="text-xs text-slate-500 mt-1">גבייה ידנית מלקוחות פעילים</p>
          </CardContent>
        </Card>

        {/* Incidents Volume */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">דיווחים במערכת</CardTitle>
            <Activity className="size-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-950">{incidentsToday}</div>
            <p className="text-xs text-slate-500 mt-1">היום | {incidents7Days} דיווחים ב-7 ימים אחרונים</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Side: Orgs requiring attention */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              <CardTitle>עסקים שדורשים תשומת לב</CardTitle>
            </div>
            <CardDescription>
              לקוחות מושעים, לקוחות ללא שימוש לאחרונה או כאלה שחצו את מגבלת המנוי.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orgsRequiringAttention.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                כל הלקוחות במצב תקין ופעיל! ✨
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orgsRequiringAttention.map(({ org, reason, level, lastIncidentDate }) => (
                  <div key={org.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <Link
                        href={`/super/organizations/${org.id}`}
                        className="font-semibold text-slate-950 hover:text-sky-600 transition-colors text-sm"
                      >
                        {org.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span>דיווח אחרון: {lastIncidentDate}</span>
                        <span>•</span>
                        <span>תוכנית: {org.plan}</span>
                      </div>
                    </div>
                    <Badge variant={level === "danger" ? "danger" : "warning"}>
                      {reason}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Side: Activity Log Feed */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="size-5 text-slate-500" />
              <CardTitle>פעילות מערכת אחרונה</CardTitle>
            </div>
            <CardDescription>פעולות ניהוליות ושינויי מערכת אחרונים.</CardDescription>
          </CardHeader>
          <CardContent>
            {sortedLogs.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                אין יומן פעילות מוקלט כרגע.
              </div>
            ) : (
              <div className="space-y-4">
                {sortedLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm border-r-2 border-slate-100 pr-3">
                    <div className="space-y-1">
                      <p className="text-slate-900 font-medium leading-relaxed">
                        {log.action === "incident_seeded" ? "אותחלו נתוני דמו" : log.action}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>משתמש: {log.actorUserId || "מערכת"}</span>
                        <span>•</span>
                        <span>
                          {new Date(log.createdAt).toLocaleString("he-IL", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Recent added Organizations */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>עסקים חדשים שהצטרפו</CardTitle>
          <CardDescription>העסקים האחרונים שנוספו לפלטפורמה.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium pb-2">
                  <th className="py-2 pr-4">שם עסק</th>
                  <th className="py-2">תוכנית</th>
                  <th className="py-2">סטטוס מנוי</th>
                  <th className="py-2">גבייה</th>
                  <th className="py-2 pl-4">תאריך הקמה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {organizations
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                  .map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-slate-900">
                        <Link href={`/super/organizations/${org.id}`} className="hover:text-sky-600 transition-colors">
                          {org.name}
                        </Link>
                      </td>
                      <td className="py-3 capitalize">{org.plan}</td>
                      <td className="py-3">
                        <Badge variant={(org.status === "active" || (!org.status && org.isActive)) ? "success" : org.status === "trial" ? "secondary" : "outline"}>
                          {org.status === "active" ? "פעיל" : org.status === "trial" ? "תקופת ניסיון" : org.status === "suspended" ? "מושעה" : org.status === "cancelled" ? "מבוטל" : "פעיל"}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {org.monthlyPrice ? `${org.monthlyPrice} ₪/חודש` : "חינם / ללא מחיר"}
                      </td>
                      <td className="py-3 pl-4 text-xs text-slate-400">
                        {new Date(org.createdAt).toLocaleDateString("he-IL")}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
