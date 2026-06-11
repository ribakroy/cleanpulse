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
import { createIssueTypeLabelMap, formatIncidentRatingSubtitle, formatIncidentTitle } from "@/lib/admin/presenters";
import type { NotificationLogRecord } from "@/lib/data/types";
import type { IssueTypeKey } from "@/types/domain";
import { ReportsDonutChart } from "@/components/admin/reports-donut-chart";
import { 
  Download, 
  Filter, 
  MapPin, 
  Clock, 
  Activity, 
  AlertTriangle, 
  ShieldAlert,
  Building
} from "lucide-react";

export const metadata = {
  title: "דוחות ונתונים | CleanPulse",
};

function normalizeReportDate(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = isoMatch[1]!;
    const month = isoMatch[2]!;
    const day = isoMatch[3]!;
    return isValidDateParts(year, month, day) ? `${year}-${month}-${day}` : "";
  }

  const localMatch = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (localMatch) {
    const dayValue = localMatch[1]!;
    const monthValue = localMatch[2]!;
    const year = localMatch[3]!;
    const day = dayValue.padStart(2, "0");
    const month = monthValue.padStart(2, "0");
    return isValidDateParts(year, month, day) ? `${year}-${month}-${day}` : "";
  }

  return "";
}

function isValidDateParts(year: string, month: string, day: string) {
  const date = new Date(`${year}-${month}-${day}T12:00:00`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === Number(year) &&
    date.getMonth() + 1 === Number(month) &&
    date.getDate() === Number(day)
  );
}

function formatDateForInput(value: string | undefined) {
  const normalized = normalizeReportDate(value);
  if (!normalized) return value || "";
  const [year, month, day] = normalized.split("-");
  return `${day}/${month}/${year}`;
}

function formatDayLabel(value: string) {
  const normalized = normalizeReportDate(value);
  if (!normalized) return value;
  const [, month, day] = normalized.split("-");
  return `${day}/${month}`;
}

function formatWeekdayLabel(value: string) {
  const normalized = normalizeReportDate(value);
  if (!normalized) return "";
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "short",
    timeZone: "Asia/Jerusalem",
  }).format(new Date(`${normalized}T12:00:00`));
}

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
  const rawStartDate = params.startDate || "";
  const rawEndDate = params.endDate || "";
  const filterStartDate = normalizeReportDate(rawStartDate);
  const filterEndDate = normalizeReportDate(rawEndDate);
  const startDateInputValue = formatDateForInput(rawStartDate);
  const endDateInputValue = formatDateForInput(rawEndDate);
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
        title="דוחות"
        description="סיכום תפעולי ברור לפי תקופה, סניף וסוג תקלה."
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
            <Input
              id="startDate"
              name="startDate"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              lang="he"
              dir="ltr"
              label="מתאריך פתיחה"
              placeholder="10/06/2026"
              defaultValue={startDateInputValue}
              className="text-right font-medium tabular-nums"
            />

            <Input
              id="endDate"
              name="endDate"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              lang="he"
              dir="ltr"
              label="עד תאריך פתיחה"
              placeholder="10/06/2026"
              defaultValue={endDateInputValue}
              className="text-right font-medium tabular-nums"
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
                  className={buttonVariants({ variant: "primary", size: "lg" }) + " flex-1"}
                >
                  סנן תוצאות
                </button>
                <Link
                  href="/admin/reports"
                  className={buttonVariants({ variant: "ghost", size: "lg" })}
                >
                  איפוס
                </Link>
              </div>

            </form>
          </CardContent>
        </Card>

      {/* KPI Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "דיווחים בטווח",
            value: metrics.totalCount,
            description: "לפי הסינון שנבחר.",
            icon: Activity,
            color: "bg-brand-soft text-brand border-brand/20",
          },
          {
            label: "פתוחים עכשיו",
            value: metrics.openCount,
            description: "ממתינים לטיפול.",
            icon: ShieldAlert,
            color: "bg-danger/8 text-danger border-danger/20",
          },
          {
            label: "נסגרו",
            value: `${metrics.resolutionRatePercentage}%`,
            description: "שיעור טיפולים שהושלמו.",
            icon: Clock,
            color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          },
          {
            label: "תגובה ממוצעת",
            value: metrics.avgResponseTimeMinutes !== null ? `${metrics.avgResponseTimeMinutes} דק'` : "אין נתונים",
            description: "עד אישור קבלה.",
            icon: Clock,
            color: "bg-amber-50 text-amber-700 border-amber-200",
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
          <section className="grid min-w-0 gap-6 lg:grid-cols-2">
            
            {/* Incidents by Day */}
            <Card className="min-w-0 border shadow-soft lg:col-span-2">
              <CardHeader className="border-b border-border bg-white/40">
                <CardTitle className="text-sm font-bold">דיווחים לפי ימים</CardTitle>
              </CardHeader>
              <CardContent className="min-w-0 pt-6">
                {incidentsByDay.length === 0 ? (
                  <p className="text-xs text-muted text-center py-4">אין נתוני ימים בטווח.</p>
                ) : (
                  <div dir="ltr" className="max-w-full min-w-0 overflow-x-auto pb-2">
                    <div
                      dir="ltr"
                      className="min-h-64 min-w-full rounded-[var(--radius-lg)] border border-border/70 bg-surface-muted/40 px-3 pb-5 pt-8 sm:px-4"
                    >
                      <div className="flex h-44 items-end gap-2 border-b border-border/70 pb-3 sm:gap-4">
                        {incidentsByDay.map((d) => {
                          const barHeight = d.count > 0 ? Math.max(14, Math.round((d.count / maxDayCount) * 128)) : 6;
                          return (
                            <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                              <span className="text-sm font-extrabold text-brand-deep tabular-nums">
                                {d.count > 0 ? d.count : ""}
                              </span>
                              <div
                                className="w-full max-w-11 rounded-t-2xl bg-sky-300/70 transition-colors duration-200 hover:bg-brand"
                                style={{ height: `${barHeight}px` }}
                                aria-label={`${d.count} דיווחים ביום ${formatDayLabel(d.label)}`}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 flex gap-4">
                        {incidentsByDay.map((d) => (
                          <div key={d.label} className="flex flex-1 flex-col items-center gap-1 text-center">
                            <span className="text-xs font-bold text-brand-deep tabular-nums" dir="ltr">
                              {formatDayLabel(d.label)}
                            </span>
                            <span className="text-[11px] text-muted" dir="rtl">{formatWeekdayLabel(d.label)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Incidents by Hour */}
            <Card className="min-w-0 border shadow-soft">
              <CardHeader className="border-b border-border bg-white/40">
                <CardTitle className="text-sm font-bold">דיווחים לפי שעות</CardTitle>
              </CardHeader>
              <CardContent className="min-w-0 px-3 pt-6 sm:px-5">
                {incidentsByHour.length === 0 ? (
                  <p className="text-xs text-muted text-center py-4">אין נתוני שעות בטווח.</p>
                ) : (
                  <div dir="ltr" className="flex h-48 items-end justify-between gap-1.5 pt-5">
                    {incidentsByHour.map((d) => {
                      const barHeight = d.count > 0 ? Math.max(8, Math.round((d.count / maxHourCount) * 122)) : 0;
                      return (
                        <div key={d.label} className="group flex flex-1 flex-col items-center justify-end gap-1.5">
                          <span className="mb-1 text-[11px] font-bold text-brand-deep tabular-nums">
                            {d.count > 0 ? d.count : ""}
                          </span>
                          {d.count > 0 ? (
                            <div
                              className="w-full max-w-4 rounded-t-xl bg-sky-300/60 transition-colors duration-200 hover:bg-brand"
                              style={{ height: `${barHeight}px` }}
                            />
                          ) : (
                            <div className="h-1.5 w-full max-w-4 rounded-t-xl bg-slate-100/80" />
                          )}
                          <span className="mt-1 text-[10px] leading-none text-muted tabular-nums">
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
            <Card className="min-w-0 border shadow-soft">
              <CardHeader className="border-b border-border bg-white/40">
                <CardTitle className="text-sm font-bold">דיווחים לפי סוג תקלה</CardTitle>
              </CardHeader>
              <CardContent className="min-w-0 px-3 pt-6 sm:px-5">
                <ReportsDonutChart
                  incidentsByIssue={incidentsByIssue}
                  chartColors={chartColors}
                  totalIssuesCount={totalIssuesCount}
                />
              </CardContent>
            </Card>

          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="border shadow-soft">
              <CardHeader className="border-b border-border bg-white/40">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building className="size-4 text-brand" />
                  סניפים
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {branchSummary.map((branch) => (
                  <div key={branch.id} className="rounded-[var(--radius-md)] border border-border bg-white/75 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-foreground">{branch.name}</p>
                        <p className="mt-1 text-xs text-muted">
                          {branch.avgResolution !== null ? `סגירה ממוצעת ${branch.avgResolution} דק'` : "אין זמן ממוצע"}
                        </p>
                      </div>
                      <Badge variant={branch.open > 0 ? "warning" : "success"} className="shrink-0">
                        {branch.open > 0 ? `${branch.open} פתוחים` : "תקין"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-brand-deep">{branch.total} דיווחים</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border shadow-soft">
              <CardHeader className="border-b border-border bg-white/40">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <MapPin className="size-4 text-brand" />
                  אזורים מובילים
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {restroomSummary.map((restroom) => (
                  <div key={restroom.id} className="rounded-[var(--radius-md)] border border-border bg-white/75 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-foreground">{restroom.name}</p>
                        <p className="mt-1 text-xs text-muted">{restroom.branchName}</p>
                      </div>
                      <Badge variant={restroom.open > 0 ? "warning" : "success"} className="shrink-0">
                        {restroom.open > 0 ? `${restroom.open} פתוחים` : "תקין"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-brand-deep">{restroom.total} דיווחים</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border shadow-soft">
              <CardHeader className="border-b border-border bg-white/40">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-danger">
                  <AlertTriangle className="size-4" />
                  דיווחים שמתעכבים
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {overdueIncidents.length === 0 ? (
                  <p className="text-xs text-muted text-center py-4">אין כרגע דיווחים שמתעכבים בסינון שנבחר.</p>
                ) : (
                  overdueIncidents.map((incident) => (
                    <Link
                      key={incident.id}
                      href={`/admin/incidents/${incident.id}`}
                      className="block rounded-[var(--radius-md)] border border-danger/20 bg-danger/5 p-3 text-xs hover:bg-danger/8"
                    >
                      <p className="text-[11px] font-semibold text-muted">מה דווח על ידי הלקוחות</p>
                      <p className="mt-1 font-bold text-danger">{formatIncidentTitle(incident, issueTypeLabels)}</p>
                      <p className="mt-1 font-semibold text-brand-deep">
                        {formatIncidentRatingSubtitle(incident)}
                      </p>
                      <p className="mt-1 text-muted">
                        {branchNames.get(incident.branchId) || "לא ידוע"} · {restroomNames.get(incident.restroomId) || "לא ידוע"}
                      </p>
                      <p className="mt-1 text-muted">{formatDateTime(incident.openedAt)}</p>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border shadow-soft">
              <CardHeader className="border-b border-border bg-white/40">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-danger">
                  <ShieldAlert className="size-4" />
                  התראות לבדיקה
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {failedNotifications.length === 0 ? (
                  <p className="text-xs text-muted text-center py-4">לא נמצאו התראות שדורשות בדיקה.</p>
                ) : (
                  failedNotifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={`/admin/incidents/${notification.incidentId}`}
                      className="block rounded-[var(--radius-md)] border border-danger/20 bg-danger/5 p-3 text-xs hover:bg-danger/8"
                    >
                      <p className="font-bold text-foreground">התראה לא נשלחה</p>
                      <p className="mt-1 text-muted">{formatDateTime(notification.createdAt)}</p>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
