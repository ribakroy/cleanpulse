import Link from "next/link";
import { NoAccessState } from "@/components/admin/no-access-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { canViewReports } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { listBranchesByOrganization } from "@/lib/data/repositories/branches";
import { listIncidentsByOrganization } from "@/lib/data/repositories/incidents";
import { listRestroomsByOrganization } from "@/lib/data/repositories/restrooms";
import { listScreensByOrganization } from "@/lib/data/repositories/screens";
import { listIssueTypes } from "@/lib/data/repositories/issue-types";
import { getDataAdapter } from "@/lib/data/get-data-adapter";
import { formatDateTime } from "@/lib/utils/format";
import { 
  filterIncidents, 
  calculateReportMetrics, 
  groupIncidentsByDay, 
  groupIncidentsByHour,
  getDurationMinutes
} from "@/lib/reports/metrics";
import { createIssueTypeLabelMap, formatIncidentTitle } from "@/lib/admin/presenters";
import type { NotificationLogRecord } from "@/lib/data/types";
import type { IssueTypeKey } from "@/types/domain";
import { ReportsDonutChart } from "@/components/admin/reports-donut-chart";
import { 
  Download, 
  Filter, 
  FileSpreadsheet, 
  MapPin, 
  Clock, 
  Star, 
  Activity, 
  AlertTriangle, 
  ShieldAlert,
  Building
} from "lucide-react";

export const metadata = {
  title: "דוחות ונתונים | CleanPulse",
};

interface PageProps {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    branchId?: string;
    restroomId?: string;
    screenId?: string;
    issueKey?: string;
    status?: string;
  }>;
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const referenceDate = new Date();

  if (!canViewReports(user)) {
    return (
      <NoAccessState description="רק owner, admin או manager יכולים לצפות במסך הדוחות של הארגון." />
    );
  }

  // Resolve filters
  const params = await searchParams;
  const filterStartDate = params.startDate || "";
  const filterEndDate = params.endDate || "";
  const filterBranch = params.branchId || "";
  const filterRestroom = params.restroomId || "";
  const filterScreen = params.screenId || "";
  const filterIssue = params.issueKey || "";
  const filterStatus = params.status || "";

  // 1. Fetch data in parallel
  const [incidents, branches, restrooms, screens, issueTypes, notificationLogs] = await Promise.all([
    listIncidentsByOrganization(user.organizationId),
    listBranchesByOrganization(user.organizationId),
    listRestroomsByOrganization(user.organizationId),
    listScreensByOrganization(user.organizationId),
    listIssueTypes(),
    getDataAdapter().query("notification_logs", { organizationId: user.organizationId }),
  ]);

  const issueTypeLabels = createIssueTypeLabelMap(issueTypes);
  const branchNames = new Map(branches.map((b) => [b.id, b.name] as const));
  const restroomNames = new Map(restrooms.map((r) => [r.id, r.name] as const));

  // 2. Filter data
  const activeFilters = {
    startDate: filterStartDate || undefined,
    endDate: filterEndDate || undefined,
    branchId: filterBranch || undefined,
    restroomId: filterRestroom || undefined,
    screenId: filterScreen || undefined,
    issueKey: filterIssue || undefined,
    status: filterStatus || undefined,
  };

  const filteredIncidents = filterIncidents(incidents, activeFilters);

  // 3. Calculate report metrics
  const metrics = calculateReportMetrics(filteredIncidents, notificationLogs as NotificationLogRecord[]);

  // 4. Graph Groupings
  const incidentsByDay = groupIncidentsByDay(filteredIncidents);
  const maxDayCount = Math.max(...incidentsByDay.map((d) => d.count), 1);

  const incidentsByHour = groupIncidentsByHour(filteredIncidents);
  const maxHourCount = Math.max(...incidentsByHour.map((d) => d.count), 1);

  // Incidents by Issue Type
  const issueCounts: Record<string, number> = {};
  for (const inc of filteredIncidents) {
    if (inc.issueKey) {
      issueCounts[inc.issueKey] = (issueCounts[inc.issueKey] || 0) + 1;
    }
  }
  const incidentsByIssue = Object.entries(issueCounts).map(([key, count]) => ({
    label: issueTypeLabels.get(key as IssueTypeKey) || key,
    count,
  })).sort((a, b) => b.count - a.count);
  const totalIssuesCount = incidentsByIssue.reduce((sum, d) => sum + d.count, 0);

  // Donut chart logic
  const chartColors = [
    "#1e88e5", // brand blue
    "#38bdf8", // brand water
    "#f59e0b", // amber
    "#10b981", // emerald
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#d97a7a"  // soft red/danger
  ];


  // Email notifications breakdown
  const incidentIds = new Set(filteredIncidents.map((inc) => inc.id));
  const relevantLogs = (notificationLogs as NotificationLogRecord[]).filter((log) => incidentIds.has(log.incidentId));

  // Comparison tables data
  // Restrooms comparison
  const restroomSummary = restrooms.map((restroom) => {
    const restroomIncidents = filteredIncidents.filter((inc) => inc.restroomId === restroom.id);
    return {
      id: restroom.id,
      name: restroom.name,
      branchName: branchNames.get(restroom.branchId) || "לא ידוע",
      total: restroomIncidents.length,
      open: restroomIncidents.filter((inc) => inc.status === "open" || inc.status === "acknowledged" || inc.status === "in_progress").length,
    };
  }).sort((a, b) => b.total - a.total).slice(0, 5); // top 5 restrooms

  // Branches comparison
  const branchSummary = branches.map((branch) => {
    const branchIncidents = filteredIncidents.filter((inc) => inc.branchId === branch.id);
    const resolvedTimes = branchIncidents
      .map((inc) => getDurationMinutes(inc.openedAt, inc.resolvedAt || inc.dismissedAt))
      .filter((v): v is number => v !== null);
    const avgRes = resolvedTimes.length > 0 ? Math.round(resolvedTimes.reduce((acc, v) => acc + v, 0) / resolvedTimes.length) : null;

    const ratings = branchIncidents.map((inc) => inc.rating).filter((r): r is (1 | 2 | 3 | 4 | 5) => r !== null);
    const avgRat = ratings.length > 0 ? parseFloat((ratings.reduce((acc, v) => acc + v, 0) / ratings.length).toFixed(1)) : null;

    return {
      id: branch.id,
      name: branch.name,
      total: branchIncidents.length,
      open: branchIncidents.filter((inc) => inc.status === "open" || inc.status === "acknowledged" || inc.status === "in_progress").length,
      avgResolution: avgRes,
      avgRating: avgRat,
    };
  }).sort((a, b) => b.total - a.total);

  // Open > 30 mins (overdue)
  const nowMs = referenceDate.getTime();
  const overdueIncidents = filteredIncidents.filter((inc) => {
    if (inc.status === "resolved" || inc.status === "dismissed") return false;
    const diffMs = nowMs - new Date(inc.openedAt).getTime();
    return diffMs / 60000 >= 30;
  });

  // Failed notifications list
  const failedNotifications = relevantLogs
    .filter((l) => l.status === "failed")
    .slice(0, 5);

  // Build query string for CSV Export
  const queryParams = new URLSearchParams({
    startDate: filterStartDate,
    endDate: filterEndDate,
    branchId: filterBranch,
    restroomId: filterRestroom,
    screenId: filterScreen,
    issueKey: filterIssue,
    status: filterStatus,
  }).toString();

  return (
    <div className="space-y-6">
      <PageHeader
        title="דוחות ונתונים"
        description="ניתוח נתונים, סיכומים תפעוליים והורדת קובצי CSV."
        actions={
          <Link
            href={`/api/admin/reports/export?${queryParams}`}
            className={`${buttonVariants({ variant: "outline", size: "sm" })} gap-2 bg-white border-border hover:bg-brand-soft/50 font-bold shadow-soft`}
          >
            <Download className="size-4 text-brand-deep" />
            ייצוא ל-CSV
          </Link>
        }
      />

      {/* Filter Form Card */}
      <Card className="border shadow-soft bg-white/50 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Filter className="size-4 text-brand" />
            מסנני דוחות
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form method="GET" action="/admin/reports" className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            
            {/* Start Date */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="startDate" className="text-xs font-bold text-muted pr-1">מתאריך פתיחה</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={filterStartDate}
                className="border border-border p-2 rounded-lg text-xs bg-white focus:outline-none focus:border-brand"
              />
            </div>

            <Input
              id="endDate"
              name="endDate"
              type="date"
              label="עד תאריך פתיחה"
              defaultValue={filterEndDate}
            />

              {/* Branch */}
              <Select id="branchId" name="branchId" label="סניף" defaultValue={filterBranch}>
                <option value="">כל הסניפים</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>

              {/* Restroom */}
              <Select id="restroomId" name="restroomId" label="אזור שירותים" defaultValue={filterRestroom}>
                <option value="">כל האזורים</option>
                {restrooms.map((r) => {
                  const branchName = branchNames.get(r.branchId) || "";
                  return (
                    <option key={r.id} value={r.id}>
                      {r.name} ({branchName})
                    </option>
                  );
                })}
              </Select>

              {/* Screen */}
              <Select id="screenId" name="screenId" label="מסך" defaultValue={filterScreen}>
                <option value="">כל המסכים</option>
                {screens.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>

              {/* Issue Type */}
              <Select id="issueKey" name="issueKey" label="סוג תקלה" defaultValue={filterIssue}>
                <option value="">כל התקלות</option>
                {issueTypes.map((i) => (
                  <option key={i.key} value={i.key}>{i.labelHe}</option>
                ))}
              </Select>

              {/* Status */}
              <Select id="status" name="status" label="סטטוס" defaultValue={filterStatus}>
                <option value="">כל הסטטוסים</option>
                <option value="open">פתוח</option>
                <option value="acknowledged">התקבל</option>
                <option value="in_progress">בטיפול</option>
                <option value="resolved">טופל</option>
                <option value="dismissed">נדחה</option>
              </Select>

              {/* Actions */}
              <div className="flex gap-2 items-end">
                <button
                  type="submit"
                  className={buttonVariants({ variant: "primary", size: "sm" }) + " flex-1"}
                >
                  סנן תוצאות
                </button>
                <Link
                  href="/admin/reports"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  איפוס
                </Link>
              </div>

            </form>
          </CardContent>
        </Card>

      {/* KPI Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "סה\"כ דיווחים בטווח",
            value: metrics.totalCount,
            description: "סה\"כ אירועים שנרשמו בסינון שנבחר.",
            icon: Activity,
            color: "bg-brand-soft text-brand border-brand/20",
          },
          {
            label: "מתוכם דיווחים פתוחים",
            value: metrics.openCount,
            description: "אירועים שממתינים כעת לסגירה.",
            icon: ShieldAlert,
            color: "bg-danger/8 text-danger border-danger/20",
          },
          {
            label: "אחוז סגירה",
            value: `${metrics.resolutionRatePercentage}%`,
            description: "שיעור הטיפולים שהושלמו בהצלחה.",
            icon: Clock,
            color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          },
          {
            label: "זמן תגובה ממוצע",
            value: metrics.avgResponseTimeMinutes !== null ? `${metrics.avgResponseTimeMinutes} דק'` : "אין נתונים",
            description: "זמן ממוצע עד אישור קבלת הדיווח.",
            icon: Clock,
            color: "bg-amber-50 text-amber-700 border-amber-200",
          },
          {
            label: "זמן טיפול ממוצע",
            value: metrics.avgResolutionTimeMinutes !== null ? `${metrics.avgResolutionTimeMinutes} דק'` : "אין נתונים",
            description: "זמן ממוצע מפתיחה ועד פתרון.",
            icon: Clock,
            color: "bg-teal-50 text-teal-700 border-teal-200",
          },
          {
            label: "דירוג ממוצע בטווח",
            value: metrics.avgRating !== null ? `${metrics.avgRating} מתוך 5` : "אין דירוגים",
            description: "ממוצע ציוני שביעות רצון לקוחות.",
            icon: Star,
            color: "bg-indigo-50 text-indigo-700 border-indigo-200",
          },
          {
            label: "סוג תקלה מוביל",
            value: metrics.topIssueKey ? (issueTypeLabels.get(metrics.topIssueKey as IssueTypeKey) || metrics.topIssueKey) : "אין דיווחים",
            description: "הקטגוריה בה נפתחו הכי הרבה אירועים.",
            icon: AlertTriangle,
            color: "bg-violet-50 text-violet-700 border-violet-200",
          },
          {
            label: "התראות מייל תקינות",
            value: `${metrics.notificationSuccessRatePercentage}%`,
            description: "אחוז שליחת התראות שעברו ללא שגיאה.",
            icon: FileSpreadsheet,
            color: "bg-brand-soft text-brand border-brand/20",
          },
        ].map(({ label, value, description, icon: Icon, color }) => (
          <Card key={label} className="border shadow-soft">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
              <div className="space-y-1">
                <CardDescription className="text-xs font-bold text-muted-foreground">{label}</CardDescription>
                <CardTitle className="text-xl font-extrabold">{value}</CardTitle>
              </div>
              <span className={`flex size-8 items-center justify-center rounded-lg border ${color}`}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] text-muted leading-relaxed">{description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Visual summaries / charts */}
      {filteredIncidents.length === 0 ? (
        <Card className="border shadow-soft">
          <CardContent className="pt-6">
            <EmptyState
              title="לא נמצאו נתונים"
              description="אין דיווחים התואמים את המסננים שנבחרו. נסה לשנות את המסננים או לאפס אותם."
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Incidents by Day */}
            <Card className="border shadow-soft">
              <CardHeader className="border-b border-border bg-white/40">
                <CardTitle className="text-sm font-bold">דיווחים לפי ימים</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {incidentsByDay.length === 0 ? (
                  <p className="text-xs text-muted text-center py-4">אין נתוני ימים בטווח.</p>
                ) : (
                  <div className="flex items-end justify-between gap-2 h-36 pt-4 px-2">
                    {incidentsByDay.map((d) => {
                      const barHeight = d.count > 0 ? Math.max(4, Math.round((d.count / maxDayCount) * 80)) : 0;
                      return (
                        <div key={d.label} className="flex-1 flex flex-col justify-end items-center gap-1 group">
                          <span className="text-[9px] font-bold text-brand-deep mb-1 shrink-0">
                            {d.count > 0 ? d.count : ""}
                          </span>
                          {d.count > 0 ? (
                            <div
                              className="w-full max-w-[16px] bg-sky-400/30 hover:bg-brand rounded-t-sm transition-all duration-200 shrink-0"
                              style={{ height: `${barHeight}px` }}
                            />
                          ) : (
                            <div className="w-full max-w-[16px] h-1.5 bg-slate-100/80 rounded-t-sm shrink-0" />
                          )}
                          <span className="text-[8px] text-muted rotate-45 mt-2 whitespace-nowrap leading-none origin-right shrink-0">
                            {d.label.substring(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Incidents by Hour */}
            <Card className="border shadow-soft">
              <CardHeader className="border-b border-border bg-white/40">
                <CardTitle className="text-sm font-bold">דיווחים לפי שעות</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {incidentsByHour.length === 0 ? (
                  <p className="text-xs text-muted text-center py-4">אין נתוני שעות בטווח.</p>
                ) : (
                  <div className="flex items-end justify-between gap-1 h-36 pt-4">
                    {incidentsByHour.map((d) => {
                      const barHeight = d.count > 0 ? Math.max(4, Math.round((d.count / maxHourCount) * 80)) : 0;
                      return (
                        <div key={d.label} className="flex-1 flex flex-col justify-end items-center gap-1 group">
                          <span className="text-[8px] font-bold text-brand-deep mb-1 shrink-0">
                            {d.count > 0 ? d.count : ""}
                          </span>
                          {d.count > 0 ? (
                            <div
                              className="w-full max-w-[10px] bg-sky-400/25 hover:bg-brand rounded-t-sm transition-all duration-200 shrink-0"
                              style={{ height: `${barHeight}px` }}
                            />
                          ) : (
                            <div className="w-full max-w-[10px] h-1.5 bg-slate-100/80 rounded-t-sm shrink-0" />
                          )}
                          <span className="text-[7px] text-muted mt-1 leading-none whitespace-nowrap shrink-0">
                            {d.label.split(":")[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Incidents by Issue Type */}
            <Card className="border shadow-soft md:col-span-2 lg:col-span-1">
              <CardHeader className="border-b border-border bg-white/40">
                <CardTitle className="text-sm font-bold">דיווחים לפי סוג תקלה</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ReportsDonutChart
                  incidentsByIssue={incidentsByIssue}
                  chartColors={chartColors}
                  totalIssuesCount={totalIssuesCount}
                />
              </CardContent>
            </Card>

          </section>

          {/* Tables layout */}
          <section className="grid gap-6 lg:grid-cols-2">

            {/* Branches Comparison */}
            <Card className="border shadow-soft">
              <CardHeader className="border-b border-border bg-white/40">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building className="size-4 text-brand" />
                  השוואת ביצועי סניפים
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted font-bold">
                        <th className="py-2.5 px-4 text-right">שם הסניף</th>
                        <th className="py-2.5 px-4 text-right">{"סה\"כ דיווחים"}</th>
                        <th className="py-2.5 px-4 text-right">פתוחים כעת</th>
                        <th className="py-2.5 px-4 text-right">זמן סגירה ממוצע</th>
                        <th className="py-2.5 px-4 text-right">דירוג לקוחות</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {branchSummary.map((b) => (
                        <tr key={b.id} className="hover:bg-brand-soft/10">
                          <td className="py-3 px-4 font-bold text-foreground">{b.name}</td>
                          <td className="py-3 px-4 font-mono font-semibold">{b.total}</td>
                          <td className="py-3 px-4">
                            <Badge variant={b.open > 0 ? "warning" : "success"} className="text-[10px] font-bold">
                              {b.open > 0 ? `${b.open} פתוחים` : "0"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold">
                            {b.avgResolution !== null ? `${b.avgResolution} דק'` : "—"}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold">
                            {b.avgRating !== null ? `${b.avgRating} מתוך 5` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Top Restrooms */}
            <Card className="border shadow-soft">
              <CardHeader className="border-b border-border bg-white/40">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <MapPin className="size-4 text-brand" />
                  אזורי השירותים הכי מדווחים (Top 5)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted font-bold">
                        <th className="py-2.5 px-4 text-right">אזור שירותים</th>
                        <th className="py-2.5 px-4 text-right">סניף</th>
                        <th className="py-2.5 px-4 text-right">{"סה\"כ דיווחים"}</th>
                        <th className="py-2.5 px-4 text-right">פתוחים כעת</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {restroomSummary.map((r) => (
                        <tr key={r.id} className="hover:bg-brand-soft/10">
                          <td className="py-3 px-4 font-bold text-foreground">{r.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{r.branchName}</td>
                          <td className="py-3 px-4 font-mono font-semibold">{r.total}</td>
                          <td className="py-3 px-4">
                            <Badge variant={r.open > 0 ? "warning" : "success"} className="text-[10px] font-bold">
                              {r.open > 0 ? `${r.open} פתוחים` : "0"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Open > 30 Mins (Overdue SLA) */}
            <Card className="border shadow-soft">
              <CardHeader className="border-b border-border bg-white/40">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-danger">
                  <AlertTriangle className="size-4" />
                  דיווחים בחריגת SLA (מעל 30 דקות פתוחים)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {overdueIncidents.length === 0 ? (
                  <p className="text-xs text-muted text-center py-4">אין כרגע חריגות SLA בסינון שנבחר.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted font-bold">
                          <th className="py-2.5 px-4 text-right">מזהה דיווח</th>
                          <th className="py-2.5 px-4 text-right">סניף</th>
                          <th className="py-2.5 px-4 text-right">מיקום</th>
                          <th className="py-2.5 px-4 text-right">דיווח</th>
                          <th className="py-2.5 px-4 text-right">נפתח ב-</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {overdueIncidents.map((inc) => (
                          <tr key={inc.id} className="hover:bg-danger/5">
                            <td className="py-3 px-4 font-mono font-semibold">
                              <Link href={`/admin/incidents/${inc.id}`} className="text-brand hover:underline font-bold">
                                {inc.id.substring(9, 15)}...
                              </Link>
                            </td>
                            <td className="py-3 px-4 text-foreground">{branchNames.get(inc.branchId) || "לא ידוע"}</td>
                            <td className="py-3 px-4 text-foreground">{restroomNames.get(inc.restroomId) || "לא ידוע"}</td>
                            <td className="py-3 px-4 text-danger font-bold">{formatIncidentTitle(inc, issueTypeLabels)}</td>
                            <td className="py-3 px-4 font-mono text-muted">{formatDateTime(inc.openedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Failed email notifications */}
            <Card className="border shadow-soft">
              <CardHeader className="border-b border-border bg-white/40">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-danger">
                  <ShieldAlert className="size-4" />
                  כשלי התראות מייל אחרונים
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {failedNotifications.length === 0 ? (
                  <p className="text-xs text-muted text-center py-4">לא נמצאו כשלי שליחה בסינון שנבחר.</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {failedNotifications.map((l) => (
                      <div key={l.id} className="border border-danger/20 bg-danger/5 p-2.5 rounded-lg text-xs leading-relaxed">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-foreground">אירוע: 
                            <Link href={`/admin/incidents/${l.incidentId}`} className="text-brand hover:underline mr-1 font-mono">
                              {l.incidentId.substring(9, 15)}...
                            </Link>
                          </span>
                          <span className="text-[10px] text-muted font-mono">{formatDateTime(l.createdAt)}</span>
                        </div>
                        <p className="text-muted mt-1">מקבל: <span className="font-semibold text-foreground font-mono">{l.recipientId || "כללי / ללא"}</span></p>
                        {l.errorMessage && (
                          <p className="text-danger bg-danger/8 border border-danger/15 p-1.5 rounded mt-1.5 font-mono text-[10px] break-all">
                            שגיאה: {l.errorMessage}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </section>
        </>
      )}
    </div>
  );
}
