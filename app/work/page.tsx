import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, CheckCircle2, ClipboardList, LogOut, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { WorkerActionPanel } from "@/components/work/worker-action-panel";
import { WorkPresenceBeacon } from "@/components/work/work-presence-beacon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { createIssueTypeLabelMap, formatIncidentRatingSubtitle, formatIncidentTitle } from "@/lib/admin/presenters";
import {
  filterBranchesForUser,
  filterIncidentsForUser,
  filterRestroomsForUser,
  formatRoleLabel,
  getDefaultRouteForRole,
  isOperationsWorker,
} from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { listActivityLogsByOrganization } from "@/lib/data/repositories/activity-logs";
import { listBranchesByOrganization } from "@/lib/data/repositories/branches";
import { listIncidentsByOrganization } from "@/lib/data/repositories/incidents";
import { listIssueTypes } from "@/lib/data/repositories/issue-types";
import { listRestroomsByOrganization } from "@/lib/data/repositories/restrooms";
import { formatDateTime } from "@/lib/utils/format";

export const metadata = {
  title: "אזור עבודה | CleanPulse",
};

function translateAction(action: string) {
  switch (action) {
    case "status_in_progress":
      return "התחלת טיפול";
    case "status_resolved":
      return "טיפול הושלם";
    case "restroom_reset":
      return "ניקוי מקיף";
    case "worker_note":
      return "הערת טיפול";
    default:
      return action;
  }
}

export default async function WorkerPortalPage() {
  const user = await requireUser();

  if (!isOperationsWorker(user)) {
    redirect(getDefaultRouteForRole(user.role));
  }

  const [allIncidents, allBranches, allRestrooms, issueTypes, activityLogs] = await Promise.all([
    listIncidentsByOrganization(user.organizationId),
    listBranchesByOrganization(user.organizationId),
    listRestroomsByOrganization(user.organizationId),
    listIssueTypes(),
    listActivityLogsByOrganization(user.organizationId, { limit: 80 }),
  ]);

  const issueTypeLabels = createIssueTypeLabelMap(issueTypes);
  const visibleRestrooms = filterRestroomsForUser(user, allRestrooms);
  const visibleBranches = filterBranchesForUser(user, allBranches, allRestrooms);
  const visibleIncidents = filterIncidentsForUser(user, allIncidents);
  const branchNames = new Map(visibleBranches.map((branch) => [branch.id, branch.name] as const));
  const restroomNames = new Map(visibleRestrooms.map((restroom) => [restroom.id, restroom.name] as const));
  const openStatuses = new Set(["open", "acknowledged", "in_progress"]);
  const openIncidents = visibleIncidents
    .filter((incident) => openStatuses.has(incident.status))
    .sort((left, right) => new Date(left.openedAt).getTime() - new Date(right.openedAt).getTime());
  const completedToday = activityLogs.filter((log) => {
    const created = new Date(log.createdAt);
    const now = new Date();

    return (
      log.actorUserId === user.id &&
      created.getFullYear() === now.getFullYear() &&
      created.getMonth() === now.getMonth() &&
      created.getDate() === now.getDate() &&
      (log.action === "status_resolved" || log.action === "restroom_reset")
    );
  });
  const recentUserLogs = activityLogs.filter((log) => log.actorUserId === user.id).slice(0, 6);
  const todayLabel = new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Jerusalem",
  }).format(new Date());

  return (
    <main className="min-h-screen bg-background">
      <div className="container-shell py-4 sm:py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-muted">שלום, {user.fullName}</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">אזור עבודה</h1>
          </div>
          <Link href="/logout" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <LogOut className="size-4" />
            יציאה
          </Link>
        </div>

        <section className="mb-5 grid gap-3 sm:grid-cols-3">
          <Card className="rounded-[var(--radius-md)]">
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <ClipboardList className="size-5" />
              </span>
              <div>
                <p className="text-xl font-extrabold">{openIncidents.length}</p>
                <p className="text-xs font-semibold text-muted">פתוח עכשיו</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[var(--radius-md)]">
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="size-5" />
              </span>
              <div>
                <p className="text-xl font-extrabold">{completedToday.length}</p>
                <p className="text-xs font-semibold text-muted">בוצע היום</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[var(--radius-md)]">
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <CalendarDays className="size-5" />
              </span>
              <div>
                <p className="text-sm font-extrabold">{todayLabel}</p>
                <p className="text-xs font-semibold text-muted">
                  {user.defaultShiftId ? "משמרת משויכת" : "משמרת לא הוגדרה"}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {visibleRestrooms.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <EmptyState
                title="לא הוקצו לך אזורי עבודה עדיין"
                description="אפשר להתחבר, אבל אין כרגע סניפים או אזורי שירותים שמוגדרים למשתמש שלך."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <WorkPresenceBeacon restroomId={visibleRestrooms[0]!.id} />
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">מה נשאר לטפל</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {openIncidents.length === 0 ? (
                    <EmptyState title="אין פניות פתוחות באזור שלך" description="כל המשימות המשויכות אליך סגורות כרגע." />
                  ) : (
                    openIncidents.map((incident) => (
                      <div key={incident.id} className="rounded-[var(--radius-lg)] border border-border bg-white p-4 shadow-soft">
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-muted">מה דווח על ידי הלקוחות</p>
                            <h2 className="text-lg font-extrabold text-foreground">
                              {formatIncidentTitle(incident, issueTypeLabels)}
                            </h2>
                            <p className="text-sm font-semibold text-brand-deep">
                              {formatIncidentRatingSubtitle(incident)}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={incident.status} />
                            <Badge variant="outline">{incident.priority === "high" ? "גבוה" : incident.priority === "medium" ? "בינוני" : incident.priority === "critical" ? "קריטי" : "נמוך"}</Badge>
                          </div>
                        </div>
                        <p className="mb-3 flex items-center gap-1 text-sm text-muted">
                          <MapPin className="size-4 text-brand" />
                          <strong className="text-foreground">{branchNames.get(incident.branchId) ?? "סניף לא ידוע"}</strong>
                          <span>·</span>
                          <strong className="text-foreground">{restroomNames.get(incident.restroomId) ?? "אזור לא ידוע"}</strong>
                          <span>· {formatDateTime(incident.openedAt)}</span>
                        </p>
                        <WorkerActionPanel incidentId={incident.id} status={incident.status} />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <aside className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">אזורי העבודה שלי</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {visibleRestrooms.map((restroom) => (
                    <div key={restroom.id} className="rounded-[var(--radius-md)] border border-border bg-white/75 p-3">
                      <p className="font-bold text-foreground">{restroom.name}</p>
                      <p className="text-xs text-muted">{branchNames.get(restroom.branchId) ?? "סניף לא ידוע"}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">פעילות אחרונה שלי</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentUserLogs.length === 0 ? (
                    <p className="text-sm text-muted">אין עדיין פעולות מתועדות במשמרת הזו.</p>
                  ) : (
                    recentUserLogs.map((log) => (
                      <div key={log.id} className="rounded-[var(--radius-md)] border border-border bg-white/75 p-3">
                        <p className="font-bold text-foreground">{translateAction(log.action)}</p>
                        <p className="text-xs text-muted">{formatDateTime(log.createdAt)}</p>
                        {typeof log.metadata?.note === "string" ? (
                          <p className="mt-1 text-xs text-muted">{log.metadata.note}</p>
                        ) : null}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Badge variant="outline">{formatRoleLabel(user.role)}</Badge>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
