import Link from "next/link";
import { Activity, BellRing, ChevronLeft, Clock, Mail, TabletSmartphone } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  filterBranchesForUser,
  filterIncidentsForUser,
  filterRestroomsForUser,
  filterScreensForUser,
} from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { listBranchesByOrganization } from "@/lib/data/repositories/branches";
import { listIncidentsByOrganization } from "@/lib/data/repositories/incidents";
import { listIssueTypes } from "@/lib/data/repositories/issue-types";
import { getOrganizationById } from "@/lib/data/repositories/organizations";
import { listRestroomsByOrganization } from "@/lib/data/repositories/restrooms";
import { listScreensByOrganization } from "@/lib/data/repositories/screens";
import { getDataAdapter } from "@/lib/data/get-data-adapter";
import { formatDateTime } from "@/lib/utils/format";
import { IncidentsPolling } from "@/components/admin/incidents-polling";
import { createIssueTypeLabelMap, formatIncidentRatingSubtitle, formatIncidentTitle } from "@/lib/admin/presenters";
import { 
  calculateDashboardMetrics, 
  groupIncidentsByHour, 
  getScreenConnectivityStatus 
} from "@/lib/reports/metrics";
import { getSlaBadgeStyles } from "@/lib/utils/sla";
import type { NotificationLogRecord } from "@/lib/data/types";


export const metadata = {
  title: "סקירה כללית | CleanPulse",
};

export default async function AdminDashboardPage() {
  const user = await requireUser();

  // Parallel fetching of all necessary collections
  const [organization, allBranches, allScreens, allRestrooms, allIncidents, issueTypes, notificationLogs] = await Promise.all([
    getOrganizationById(user.organizationId),
    listBranchesByOrganization(user.organizationId),
    listScreensByOrganization(user.organizationId),
    listRestroomsByOrganization(user.organizationId),
    listIncidentsByOrganization(user.organizationId),
    listIssueTypes(),
    getDataAdapter().query("notification_logs", { organizationId: user.organizationId }),
  ]);

  const issueTypeLabels = createIssueTypeLabelMap(issueTypes);
  const incidents = filterIncidentsForUser(user, allIncidents);
  const restrooms = filterRestroomsForUser(user, allRestrooms);
  const branches = filterBranchesForUser(user, allBranches, allRestrooms);
  const screens = filterScreensForUser(user, allScreens);
  const branchNames = new Map(branches.map((b) => [b.id, b.name] as const));
  const restroomNames = new Map(restrooms.map((r) => [r.id, r.name] as const));

  // Priority weights
  const priorityWeight = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  // Actionable Incidents: open, acknowledged, in_progress
  // Sorted by severity desc, and then by openedAt asc (oldest first)
  const actionableIncidents = incidents
    .filter((inc) => inc.status === "open" || inc.status === "acknowledged" || inc.status === "in_progress")
    .sort((a, b) => {
      const weightA = priorityWeight[a.priority] || 0;
      const weightB = priorityWeight[b.priority] || 0;
      if (weightB !== weightA) {
        return weightB - weightA;
      }
      return new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime();
    });

  // Latest 10 incidents
  const recentIncidents = incidents.slice(0, 10);

  // Today's metrics calculations
  const referenceDate = new Date();
  const metrics = calculateDashboardMetrics(incidents, referenceDate);

  // Group today's incidents by hour
  const todayIncidents = incidents.filter((inc) => {
    const date = new Date(inc.openedAt);
    return (
      date.getFullYear() === referenceDate.getFullYear() &&
      date.getMonth() === referenceDate.getMonth() &&
      date.getDate() === referenceDate.getDate()
    );
  });
  const hourlyData = groupIncidentsByHour(todayIncidents);
  const maxHourCount = Math.max(...hourlyData.map((d) => d.count), 1);

  // Notification logs stats (for today)
  const todayLogs = (notificationLogs as NotificationLogRecord[]).filter((log) => {
    const date = new Date(log.createdAt);
    return (
      date.getFullYear() === referenceDate.getFullYear() &&
      date.getMonth() === referenceDate.getMonth() &&
      date.getDate() === referenceDate.getDate()
    );
  });
  const notifStats = {
    mock_sent: todayLogs.filter((l) => l.status === "mock_sent").length,
    sent: todayLogs.filter((l) => l.status === "sent").length,
    failed: todayLogs.filter((l) => l.status === "failed").length,
    no_recipients: todayLogs.filter((l) => l.status === "no_recipients").length,
  };

  // Screen connectivity check
  const screenStatuses = screens.map((screen) => {
    const status = getScreenConnectivityStatus(screen, referenceDate);
    return {
      ...screen,
      status,
      branchName: branchNames.get(screen.branchId) || "לא ידוע",
      restroomName: restroomNames.get(screen.restroomId) || "לא ידוע",
    };
  });

  const activeScreensCount = screenStatuses.filter((s) => s.status === "active").length;
  const warningScreensCount = screenStatuses.filter((s) => s.status === "warning").length;
  const inactiveScreensCount = screenStatuses.filter((s) => s.status === "inactive").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="סקירה כללית"
        description={`${organization?.name ?? "הארגון"} — מצב פעיל`}
        actions={<IncidentsPolling />}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "פתוחים עכשיו",
            value: metrics.openNow,
            description: "ממתינים לטיפול.",
            icon: BellRing,
            color: "bg-brand-soft text-brand border-brand/20",
          },
          {
            label: "חדשים היום",
            value: metrics.openedToday,
            description: "נפתחו היום.",
            icon: Activity,
            color: "bg-blue-50 text-blue-700 border-blue-200",
          },
          {
            label: "נסגרו היום",
            value: `${metrics.resolutionRateTodayPercentage}%`,
            description: "מתוך הדיווחים שנפתחו.",
            icon: Clock,
            color: "bg-brand-soft text-brand-deep border-brand/20",
          },
          {
            label: "תגובה ממוצעת",
            value: metrics.avgResponseTimeTodayMinutes !== null ? `${metrics.avgResponseTimeTodayMinutes} דק'` : "אין נתונים",
            description: "מקבלה לאישור.",
            icon: Clock,
            color: "bg-amber-50 text-amber-700 border-amber-200",
          },
        ].map(({ label, value, description, icon: Icon, color }) => (
          <Card key={label} className="border shadow-soft">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
              <div className="space-y-1.5">
                <CardDescription className="text-xs font-medium text-muted">{label}</CardDescription>
                <CardTitle className="text-2xl font-extrabold">{value}</CardTitle>
              </div>
              <span className={`flex size-10 items-center justify-center rounded-xl border ${color}`}>
                <Icon className="size-5" aria-hidden="true" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted leading-relaxed">{description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Urgent Actionable Column */}
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card className="border shadow-soft">
            <CardHeader className="border-b border-border bg-white/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">דורש טיפול עכשיו</CardTitle>
                  <CardDescription>דיווחים פעילים לפי עדיפות וזמן פתיחה.</CardDescription>
                </div>
                <Badge variant="outline" className="font-bold">{actionableIncidents.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {actionableIncidents.length === 0 ? (
                <EmptyState
                  title="אין משימות פתוחות"
                  description="כל הדיווחים בארגון שלך מטופלים וסגורים בהצלחה. עבודה מצוינת!"
                />
              ) : (
                actionableIncidents.map((incident) => {
                  const slaStyles = getSlaBadgeStyles(incident);
                  return (
                    <div
                      key={incident.id}
                      className="border border-border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 hover:bg-brand-soft/20 transition-all duration-150"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="min-w-[160px] space-y-1">
                            <p className="text-[11px] font-semibold text-muted">מה דווח על ידי הלקוחות</p>
                            <Link
                              href={`/admin/incidents/${incident.id}`}
                              className="block font-bold text-brand hover:underline"
                            >
                              {formatIncidentTitle(incident, issueTypeLabels)}
                            </Link>
                            <p className="text-xs font-semibold text-brand-deep">
                              {formatIncidentRatingSubtitle(incident)}
                            </p>
                          </div>
                          <StatusBadge status={incident.status} />
                          <Badge variant="outline" className="text-xs">
                            {incident.priority === "critical" ? "קריטי" : incident.priority === "high" ? "גבוה" : incident.priority === "medium" ? "בינוני" : "נמוך"}
                          </Badge>
                          <Badge className={`${slaStyles.bg} ${slaStyles.text} font-bold text-[10px] border`}>
                            {slaStyles.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted leading-relaxed">
                          <strong className="text-foreground">{branchNames.get(incident.branchId) || "לא ידוע"}</strong> ·
                          <strong className="text-foreground">{restroomNames.get(incident.restroomId) || "לא ידוע"}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className="text-[10px] text-muted font-mono">{formatDateTime(incident.openedAt)}</span>
                        <Link
                          href={`/admin/incidents/${incident.id}`}
                          className="p-1 text-muted hover:text-brand"
                        >
                          <ChevronLeft className="size-5" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Hourly trend chart */}
          <Card className="border shadow-soft">
            <CardHeader className="border-b border-border bg-white/40">
              <CardTitle className="text-lg font-bold">דיווחים היום לפי שעה</CardTitle>
              <CardDescription>פיזור הדיווחים לאורך היום.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {todayIncidents.length === 0 ? (
                <EmptyState
                  title="אין דיווחים היום"
                  description="גרף המגמות השעתי יוצג כאן ברגע שייכנסו דיווחים ראשונים היום."
                />
              ) : (
                <div className="flex items-end justify-between gap-1.5 sm:gap-3 h-48 pt-6 px-2">
                  {hourlyData.map((d) => {
                    const barHeight = d.count > 0 ? Math.max(6, Math.round((d.count / maxHourCount) * 110)) : 0;
                    return (
                      <div key={d.label} className="flex-1 flex flex-col justify-end items-center gap-1 group">
                        <span className="text-[10px] font-bold text-brand-deep mb-1 shrink-0">
                          {d.count > 0 ? d.count : ""}
                        </span>
                        {d.count > 0 ? (
                          <div
                            className="w-full max-w-[10px] bg-sky-400/50 hover:bg-brand rounded-t-sm transition-all duration-200 shrink-0"
                            style={{ height: `${barHeight}px` }}
                          />
                        ) : (
                          <div className="w-full max-w-[10px] h-1.5 bg-slate-100/80 rounded-t-sm shrink-0" />
                        )}
                        <span className="text-[9px] text-muted leading-none whitespace-nowrap mt-1 shrink-0">
                          {d.label.split(":")[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info Column */}
        <div className="min-w-0 space-y-6">
          
          {/* Active Screens Connectivity */}
          <Card className="border shadow-soft">
            <CardHeader className="border-b border-border bg-white/40">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <TabletSmartphone className="size-5 text-brand" />
                חיבור מסכים פעילים
              </CardTitle>
              <CardDescription>מצב החיבור של הטאבלטים בעסק.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center text-xs pb-3 border-b border-border">
                <div className="bg-blue-50 border border-blue-100 p-2 rounded-lg">
                  <p className="font-bold text-blue-700 text-lg">{activeScreensCount}</p>
                  <p className="text-muted text-[10px]">פעילים</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-2 rounded-lg">
                  <p className="font-bold text-amber-700 text-lg">{warningScreensCount}</p>
                  <p className="text-muted text-[10px]">ללא אות</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
                  <p className="font-bold text-slate-700 text-lg">{inactiveScreensCount}</p>
                  <p className="text-muted text-[10px]">לא פעילים</p>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 text-xs">
                {screenStatuses.length === 0 ? (
                  <p className="text-muted text-center py-4">לא הוגדרו עדיין מסכים בארגון.</p>
                ) : (
                  screenStatuses.map((screen) => (
                    <div
                      key={screen.id}
                      className="flex items-center justify-between border border-border p-2 rounded-lg bg-white/50"
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-foreground">{screen.name}</p>
                        <p className="text-[10px] text-muted leading-relaxed">
                          {screen.branchName} · {screen.restroomName}
                        </p>
                      </div>
                      
                      <Badge className={
                        screen.status === "active" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        screen.status === "warning" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-slate-100 text-slate-700 border"
                      }>
                        {screen.status === "active" ? "פעיל" :
                         screen.status === "warning" ? "ללא אות" :
                         "לא פעיל"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Email Notifications Logs (Today) */}
          <Card className="border shadow-soft">
            <CardHeader className="border-b border-border bg-white/40">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Mail className="size-5 text-brand" />
                התראות מנהלים (היום)
              </CardTitle>
              <CardDescription>מצב התראות שנוצרו היום.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {[
                { label: "התראות שנשלחו", value: notifStats.mock_sent + notifStats.sent, color: "bg-blue-50 text-blue-700 border border-blue-100" },
                { label: "נכשלו", value: notifStats.failed, color: "bg-red-50 text-red-700 border border-red-200" },
                { label: "ללא נמענים", value: notifStats.no_recipients, color: "bg-slate-100 text-slate-700 border border-slate-200" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-muted">{label}</span>
                  <Badge className={`${color} font-bold`}>{value}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent 10 incidents */}
          <Card className="border shadow-soft">
            <CardHeader className="border-b border-border bg-white/40">
              <CardTitle className="text-lg font-bold">דיווחים אחרונים</CardTitle>
              <CardDescription>הדיווחים האחרונים שנכנסו.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {recentIncidents.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">לא נמצאו דיווחים.</p>
              ) : (
                recentIncidents.map((incident) => (
                  <div key={incident.id} className="text-xs border-b border-border/50 pb-2.5 last:border-0 last:pb-0">
                    <p className="mb-1 text-[10px] font-semibold text-muted">מה דווח על ידי הלקוחות</p>
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/admin/incidents/${incident.id}`}
                        className="block max-w-[190px] font-bold text-foreground hover:text-brand hover:underline"
                      >
                        {formatIncidentTitle(incident, issueTypeLabels)}
                      </Link>
                      <StatusBadge status={incident.status} />
                    </div>
                    <p className="mt-1 text-[10px] font-semibold text-brand-deep">
                      {formatIncidentRatingSubtitle(incident)}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-muted mt-1 leading-relaxed">
                      <span>{branchNames.get(incident.branchId) || "סניף"}</span>
                      <span className="font-mono">{formatDateTime(incident.openedAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
