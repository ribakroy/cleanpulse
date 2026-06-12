import Link from "next/link";
import { ArrowRight, Brush, CheckCircle2, Clock, Filter, UsersRound } from "lucide-react";
import { NoAccessState } from "@/components/admin/no-access-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  canViewReports,
  canViewBranch,
  canViewIncident,
  canViewRestroom,
  filterBranchesForUser,
  filterIncidentsForUser,
  filterRestroomsForUser,
  formatRoleLabel,
  isOrganizationOwner,
} from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { listActivityLogsByOrganization } from "@/lib/data/repositories/activity-logs";
import { listBranchesByOrganization } from "@/lib/data/repositories/branches";
import { listDetectedShiftsByOrganization } from "@/lib/data/repositories/detected-shifts";
import { listIncidentsByOrganization } from "@/lib/data/repositories/incidents";
import { listRestroomsByOrganization } from "@/lib/data/repositories/restrooms";
import { listShiftsByOrganization } from "@/lib/data/repositories/shifts";
import { listUsersByOrganization } from "@/lib/data/repositories/users";
import { filterIncidents } from "@/lib/reports/metrics";
import { calculateTeamActivityReport } from "@/lib/reports/team";
import type { UserRole } from "@/types/domain";

export const metadata = {
  title: "תפוקת עובדים | CleanPulse",
};

interface PageProps {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    branchId?: string;
    restroomId?: string;
    userId?: string;
    role?: string;
    shiftId?: string;
    shiftLink?: string;
    action?: string;
    managerId?: string;
  }>;
}

const roleFilterOptions: UserRole[] = ["owner", "admin", "area_manager", "operations_worker", "manager", "cleaner"];
const shiftLinkOptions = new Set(["confirmed", "detected", "needs_completion", "no_shift"]);

const actionLabels: Record<string, string> = {
  status_acknowledged: "אישור קבלה",
  status_in_progress: "התחלת טיפול",
  status_resolved: "סגירת טיפול",
  status_dismissed: "דחיית דיווח",
  restroom_reset: "ניקוי מקיף",
  worker_note: "הערת עובד",
  closing_reset_run: "איפוס סוף יום",
  settings_changed: "שינוי הגדרות",
  user_created: "יצירת משתמש",
  user_updated: "עדכון משתמש",
  user_disabled: "השבתת משתמש",
  user_password_reset: "איפוס סיסמה",
  shift_created: "יצירת משמרת",
  shift_updated: "עדכון משמרת",
  shift_disabled: "השבתת משמרת",
  user_login: "כניסה למערכת",
  work_portal_viewed: "כניסה לאזור עבודה",
  detected_shift_created: "זיהוי משמרת",
  detected_shift_updated: "עדכון זיהוי משמרת",
  detected_shift_completion_requested: "בקשת השלמת משמרת",
  detected_shift_confirmed: "אישור משמרת שזוהתה",
  detected_shift_dismissed: "דחיית משמרת שזוהתה",
};

function normalizeReportDate(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return trimmed;

  const localMatch = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!localMatch) return "";

  return `${localMatch[3]}-${localMatch[2]!.padStart(2, "0")}-${localMatch[1]!.padStart(2, "0")}`;
}

function formatDateForInput(value: string | undefined) {
  const normalized = normalizeReportDate(value);
  if (!normalized) return value || "";
  const [year, month, day] = normalized.split("-");
  return `${day}/${month}/${year}`;
}

function isLogInDateRange(logDate: string, startDate: string, endDate: string) {
  const timestamp = new Date(logDate).getTime();

  if (startDate && timestamp < new Date(`${startDate}T00:00:00`).getTime()) {
    return false;
  }

  if (endDate && timestamp > new Date(`${endDate}T23:59:59`).getTime()) {
    return false;
  }

  return true;
}

function buildTeamReportHref(params: Record<string, string>, patch: Record<string, string>) {
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) next.set(key, value);
  }

  for (const [key, value] of Object.entries(patch)) {
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
  }

  const query = next.toString();
  return query ? `/admin/reports/team?${query}` : "/admin/reports/team";
}

function getDetectedShiftStatusLabel(status: string | undefined) {
  if (status === "confirmed") return "משמרת שזוהתה ואושרה";
  if (status === "needs_completion") return "משמרת שזוהתה - דורשת השלמה";
  if (status === "dismissed") return "משמרת שזוהתה - נדחתה";
  if (status === "draft") return "משמרת שזוהתה";
  return "משמרת שזוהתה";
}

function getShiftLinkLabel(input: {
  shiftId?: string | undefined;
  detectedShiftId?: string | undefined;
  detectedStatus?: string | undefined;
}) {
  if (input.shiftId) return "משמרת ידנית";
  if (input.detectedShiftId) return getDetectedShiftStatusLabel(input.detectedStatus);
  return "ללא שיוך משמרת";
}

function matchesShiftLinkFilter(input: {
  shiftId?: string | undefined;
  detectedShiftId?: string | undefined;
  detectedStatus?: string | undefined;
}, filter: string) {
  if (!filter) return true;
  if (filter === "confirmed") return Boolean(input.shiftId || input.detectedStatus === "confirmed");
  if (filter === "detected") return Boolean(input.detectedShiftId);
  if (filter === "needs_completion") return input.detectedStatus === "needs_completion";
  if (filter === "no_shift") return !input.shiftId && !input.detectedShiftId;
  return true;
}

export default async function TeamReportsPage({ searchParams }: PageProps) {
  const user = await requireUser();

  if (!canViewReports(user)) {
    return <NoAccessState description="רק owner, admin או מנהל אזור יכולים לצפות בדוחות צוות." />;
  }

  const params = await searchParams;
  const startDate = normalizeReportDate(params.startDate);
  const endDate = normalizeReportDate(params.endDate);
  const filterBranch = params.branchId || "";
  const filterRestroom = params.restroomId || "";
  const filterUser = params.userId || "";
  const filterRole = roleFilterOptions.includes(params.role as UserRole) ? params.role as UserRole : "";
  const filterShift = params.shiftId || "";
  const filterShiftLink = shiftLinkOptions.has(params.shiftLink ?? "") ? params.shiftLink ?? "" : "";
  const filterAction = params.action || "";
  const filterManager = params.managerId || "";

  const [allIncidents, allBranches, allRestrooms, users, activityLogs, shifts, detectedShifts] = await Promise.all([
    listIncidentsByOrganization(user.organizationId),
    listBranchesByOrganization(user.organizationId),
    listRestroomsByOrganization(user.organizationId),
    listUsersByOrganization(user.organizationId),
    listActivityLogsByOrganization(user.organizationId, { limit: 1000 }),
    listShiftsByOrganization(user.organizationId),
    listDetectedShiftsByOrganization(user.organizationId),
  ]);

  const scopedIncidents = filterIncidentsForUser(user, allIncidents);
  const restrooms = filterRestroomsForUser(user, allRestrooms);
  const branches = filterBranchesForUser(user, allBranches, allRestrooms);
  const branchNames = new Map(branches.map((branch) => [branch.id, branch.name] as const));
  const restroomNames = new Map(restrooms.map((restroom) => [restroom.id, restroom.name] as const));
  const visibleBranchIds = new Set(branches.map((branch) => branch.id));
  const visibleRestroomIds = new Set(restrooms.map((restroom) => restroom.id));
  const scopedShifts = shifts.filter((shift) => !shift.branchId || visibleBranchIds.has(shift.branchId));
  const scopedDetectedShifts = detectedShifts.filter((shift) => {
    if (shift.branchId && !visibleBranchIds.has(shift.branchId)) return false;
    if (shift.restroomIds?.length && shift.restroomIds.some((restroomId) => !visibleRestroomIds.has(restroomId))) return false;
    return Boolean(shift.branchId || shift.restroomIds?.length || isOrganizationOwner(user));
  });
  const shiftNames = new Map(scopedShifts.map((shift) => [shift.id, shift.name] as const));
  const detectedShiftNames = new Map(scopedDetectedShifts.map((shift) => [shift.id, shift.shiftName ?? "משמרת שזוהתה"] as const));
  const detectedShiftsById = new Map(scopedDetectedShifts.map((shift) => [shift.id, shift] as const));
  const visibleDetectedShiftIds = new Set(scopedDetectedShifts.map((shift) => shift.id));
  const usersById = new Map(users.map((reportUser) => [reportUser.id, reportUser] as const));
  const userNames = new Map(users.map((reportUser) => [reportUser.id, reportUser.fullName] as const));
  const incidentsById = new Map(scopedIncidents.map((incident) => [incident.id, incident] as const));
  const managerOptions = users.filter((candidate) =>
    (candidate.role === "area_manager" || candidate.role === "manager") &&
    (isOrganizationOwner(user) || candidate.id === user.id),
  );
  const selectedManager = managerOptions.find((candidate) => candidate.id === filterManager) ?? null;
  const filteredIncidents = filterIncidents(scopedIncidents, {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    branchId: filterBranch || undefined,
    restroomId: filterRestroom || undefined,
  });
  const incidentIds = new Set(filteredIncidents.map((incident) => incident.id));
  const baseScopedLogs = activityLogs.filter((log) => {
    if (!isLogInDateRange(log.createdAt, startDate, endDate)) return false;
    if (log.incidentId) return incidentIds.has(log.incidentId);
    if (log.detectedShiftId && !visibleDetectedShiftIds.has(log.detectedShiftId)) return false;
    if (log.restroomId && !visibleRestroomIds.has(log.restroomId)) return false;
    if (log.branchId && !visibleBranchIds.has(log.branchId)) return false;
    if (filterRestroom && log.restroomId !== filterRestroom) return false;
    if (filterBranch && log.branchId !== filterBranch) return false;
    return Boolean(log.branchId || log.restroomId || log.detectedShiftId);
  });
  const managerScopedLogs = selectedManager ? baseScopedLogs.filter((log) => {
    if (log.incidentId) {
      const incident = incidentsById.get(log.incidentId);
      return incident ? canViewIncident(selectedManager, incident) : false;
    }

    if (log.restroomId) {
      const restroom = allRestrooms.find((candidate) => candidate.id === log.restroomId);
      return restroom ? canViewRestroom(selectedManager, restroom) : false;
    }

    if (log.branchId) {
      return canViewBranch(selectedManager, log.branchId);
    }

    return false;
  }) : baseScopedLogs;
  const availableUserIds = new Set(managerScopedLogs.map((log) => log.actorUserId).filter((id): id is string => Boolean(id)));
  const userOptions = users.filter((reportUser) => availableUserIds.has(reportUser.id));
  const availableActions = Array.from(new Set(managerScopedLogs.map((log) => log.action))).sort((left, right) =>
    (actionLabels[left] ?? left).localeCompare(actionLabels[right] ?? right, "he"),
  );
  const scopedLogs = managerScopedLogs.filter((log) => {
    if (filterUser && log.actorUserId !== filterUser) return false;
    if (filterRole) {
      const actorRole = log.actorRole ?? (log.actorUserId ? usersById.get(log.actorUserId)?.role : undefined);
      if (actorRole !== filterRole) return false;
    }
    if (filterShift && log.shiftId !== filterShift && log.detectedShiftId !== filterShift) return false;
    if (filterShiftLink && !matchesShiftLinkFilter({
      shiftId: log.shiftId,
      detectedShiftId: log.detectedShiftId,
      detectedStatus: log.detectedShiftId ? detectedShiftsById.get(log.detectedShiftId)?.status : undefined,
    }, filterShiftLink)) return false;
    if (filterAction && log.action !== filterAction) return false;
    return true;
  });
  const report = calculateTeamActivityReport({
    users,
    incidents: filteredIncidents,
    activityLogs: scopedLogs,
    shifts: scopedShifts,
    detectedShifts: scopedDetectedShifts,
  });
  const unassignedShiftLogs = scopedLogs.filter((log) => !log.shiftId && !log.detectedShiftId);
  const recentLogs = scopedLogs.slice(0, 12);
  const filterState = {
    startDate,
    endDate,
    branchId: filterBranch,
    restroomId: filterRestroom,
    userId: filterUser,
    role: filterRole,
    shiftId: filterShift,
    shiftLink: filterShiftLink,
    action: filterAction,
    managerId: filterManager,
  };
  const exportParams = new URLSearchParams();
  for (const [key, value] of Object.entries(filterState)) {
    if (value) exportParams.set(key, value);
  }
  const exportHref = `/api/admin/reports/team/export${exportParams.toString() ? `?${exportParams.toString()}` : ""}`;
  const totals = report.members.reduce(
    (acc, member) => ({
      actions: acc.actions + member.totalActions,
      started: acc.started + member.startedIncidents,
      resolved: acc.resolved + member.resolvedIncidents,
      resets: acc.resets + member.restroomResets,
    }),
    { actions: 0, started: 0, resolved: 0, resets: 0 },
  );
  const avgResponseValues = report.members
    .map((member) => member.avgResponseMinutes)
    .filter((value): value is number => value !== null);
  const avgHandlingValues = report.members
    .map((member) => member.avgHandlingMinutes)
    .filter((value): value is number => value !== null);
  const avgResolutionValues = report.members
    .map((member) => member.avgResolutionMinutes)
    .filter((value): value is number => value !== null);
  const avgResponse = avgResponseValues.length > 0
    ? Math.round(avgResponseValues.reduce((total, value) => total + value, 0) / avgResponseValues.length)
    : null;
  const avgHandling = avgHandlingValues.length > 0
    ? Math.round(avgHandlingValues.reduce((total, value) => total + value, 0) / avgHandlingValues.length)
    : null;
  const avgResolution = avgResolutionValues.length > 0
    ? Math.round(avgResolutionValues.reduce((total, value) => total + value, 0) / avgResolutionValues.length)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="תמונת פעילות צוות"
        description="טיפולים, ניקויים ופעילות לפי עובד על בסיס פעולות מתועדות."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href={exportHref} className={buttonVariants({ variant: "secondary", size: "sm" })}>
              ייצוא CSV
            </Link>
            <Link href="/admin/reports" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <ArrowRight className="size-4" />
              חזרה לדוחות
            </Link>
          </div>
        }
      />

      <Card>
        <CardHeader className="border-b border-border bg-white/40">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Filter className="size-4 text-brand" />
            מסנני דוח צוות
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form method="GET" action="/admin/reports/team" className="grid gap-4 md:grid-cols-4">
            <Input
              name="startDate"
              label="מתאריך"
              placeholder="10/06/2026"
              defaultValue={formatDateForInput(params.startDate)}
              dir="ltr"
              className="text-right"
            />
            <Input
              name="endDate"
              label="עד תאריך"
              placeholder="12/06/2026"
              defaultValue={formatDateForInput(params.endDate)}
              dir="ltr"
              className="text-right"
            />
            <Select name="branchId" label="סניף" defaultValue={filterBranch}>
              <option value="">כל הסניפים</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
            <Select name="restroomId" label="אזור שירותים" defaultValue={filterRestroom}>
              <option value="">כל האזורים</option>
              {restrooms.map((restroom) => (
                <option key={restroom.id} value={restroom.id}>
                  {restroom.name} ({branchNames.get(restroom.branchId) ?? "סניף לא ידוע"})
                </option>
              ))}
            </Select>
            <Select name="userId" label="עובד" defaultValue={filterUser}>
              <option value="">כל העובדים</option>
              {userOptions.map((reportUser) => (
                <option key={reportUser.id} value={reportUser.id}>
                  {reportUser.fullName} ({formatRoleLabel(reportUser.role)})
                </option>
              ))}
            </Select>
            <Select name="role" label="תפקיד" defaultValue={filterRole}>
              <option value="">כל התפקידים</option>
              {roleFilterOptions.map((role) => (
                <option key={role} value={role}>
                  {formatRoleLabel(role)}
                </option>
              ))}
            </Select>
            <Select name="managerId" label="מנהל אזור/משמרת" defaultValue={filterManager}>
              <option value="">כל המנהלים</option>
              {managerOptions.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.fullName}
                </option>
              ))}
            </Select>
            <Select name="shiftId" label="משמרת" defaultValue={filterShift}>
              <option value="">כל המשמרות</option>
              {scopedShifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name} · ידנית
                </option>
              ))}
              {scopedDetectedShifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {(shift.shiftName ?? "משמרת שזוהתה")} · זוהתה
                </option>
              ))}
            </Select>
            <Select name="shiftLink" label="סוג שיוך משמרת" defaultValue={filterShiftLink}>
              <option value="">כל סוגי השיוך</option>
              <option value="confirmed">משמרת ידנית/מאושרת</option>
              <option value="detected">משמרת שזוהתה</option>
              <option value="needs_completion">דורש השלמה</option>
              <option value="no_shift">ללא משמרת</option>
            </Select>
            <Select name="action" label="פעולה" defaultValue={filterAction}>
              <option value="">כל הפעולות</option>
              {availableActions.map((action) => (
                <option key={action} value={action}>
                  {actionLabels[action] ?? action}
                </option>
              ))}
            </Select>
            <div className="flex gap-2 md:col-span-4">
              <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
                סנן
              </button>
              <Link href="/admin/reports/team" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                איפוס
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "אנשי צוות פעילים", value: report.members.length, icon: UsersRound },
          { label: "תחילת טיפולים", value: totals.started, icon: Clock },
          { label: "טיפולים שבוצעו", value: totals.resolved, icon: CheckCircle2 },
          { label: "ניקויים מקיפים", value: totals.resets, icon: Brush },
          { label: "זמן תגובה ממוצע", value: avgResponse !== null ? `${avgResponse} דק'` : "אין נתונים", icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-xl border border-brand/15 bg-brand-soft text-brand">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-xl font-extrabold">{value}</p>
                <p className="text-xs font-semibold text-muted">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>תפוקה לפי עובד</CardTitle>
        </CardHeader>
        <CardContent>
          {report.members.length === 0 ? (
            <EmptyState
              title="אין מספיק נתוני פעילות צוות עדיין"
              description="ברגע שעובדים יסמנו התחלת טיפול, טיפול או ניקוי מקיף, הדוח יתמלא כאן."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-sm">
                <thead>
                  <tr className="text-right text-xs text-muted">
                    <th className="px-3 py-2">עובד</th>
                    <th className="px-3 py-2">תפקיד</th>
                    <th className="px-3 py-2">פעולות</th>
                    <th className="px-3 py-2">התחלות טיפול</th>
                    <th className="px-3 py-2">טיפולים</th>
                    <th className="px-3 py-2">ניקויים מקיפים</th>
                    <th className="px-3 py-2">זמן תגובה</th>
                    <th className="px-3 py-2">זמן טיפול</th>
                    <th className="px-3 py-2">זמן סגירה ממוצע</th>
                    <th className="px-3 py-2">אזורים</th>
                    <th className="px-3 py-2">משמרות</th>
                  </tr>
                </thead>
                <tbody>
                  {report.members.map((member) => (
                    <tr key={member.actorKey} className="rounded-[var(--radius-md)] bg-white shadow-soft">
                      <td className="rounded-r-[var(--radius-md)] px-3 py-3 font-bold text-foreground">
                        <Link
                          href={buildTeamReportHref(filterState, { userId: member.actorKey })}
                          className="text-brand-deep hover:underline"
                        >
                          {member.actorFullName}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-muted">
                        {member.actorRole === "system" || member.actorRole === "לא זמין"
                          ? member.actorRole
                          : formatRoleLabel(member.actorRole as UserRole)}
                      </td>
                      <td className="px-3 py-3 font-semibold">{member.totalActions}</td>
                      <td className="px-3 py-3 font-semibold">{member.startedIncidents}</td>
                      <td className="px-3 py-3 font-semibold">{member.resolvedIncidents}</td>
                      <td className="px-3 py-3 font-semibold">{member.restroomResets}</td>
                      <td className="px-3 py-3">
                        {member.avgResponseMinutes !== null ? `${member.avgResponseMinutes} דק'` : "אין נתונים"}
                      </td>
                      <td className="px-3 py-3">
                        {member.avgHandlingMinutes !== null ? `${member.avgHandlingMinutes} דק'` : "אין נתונים"}
                      </td>
                      <td className="px-3 py-3">
                        {member.avgResolutionMinutes !== null ? `${member.avgResolutionMinutes} דק'` : "אין נתונים"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex max-w-sm flex-wrap gap-1">
                          {member.restroomIds.length === 0 ? (
                            <span className="text-xs text-muted">לא זמין</span>
                          ) : (
                            member.restroomIds.slice(0, 4).map((restroomId) => (
                              <Badge key={restroomId} variant="outline" className="text-[11px]">
                                {restroomNames.get(restroomId) ?? "אזור לא ידוע"}
                              </Badge>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="rounded-l-[var(--radius-md)] px-3 py-3">
                        <div className="flex max-w-sm flex-wrap gap-1">
                          {member.shiftIds.length === 0 && member.detectedShiftIds.length === 0 ? (
                            <span className="text-xs text-muted">לא זמין</span>
                          ) : (
                            <>
                              {member.shiftIds.slice(0, 3).map((shiftId) => (
                                <Link key={shiftId} href={buildTeamReportHref(filterState, { shiftId })}>
                                  <Badge variant="outline" className="text-[11px] hover:border-brand/40">
                                    {shiftNames.get(shiftId) ?? "משמרת לא ידועה"}
                                  </Badge>
                                </Link>
                              ))}
                              {member.detectedShiftIds.slice(0, 3).map((shiftId) => (
                                <Link key={shiftId} href={buildTeamReportHref(filterState, { shiftId })}>
                                  <Badge variant="warning" className="text-[11px] hover:border-brand/40">
                                    {detectedShiftNames.get(shiftId) ?? "משמרת שזוהתה"}
                                  </Badge>
                                </Link>
                              ))}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>פעילות לפי משמרת</CardTitle>
        </CardHeader>
        <CardContent>
          {report.shifts.length === 0 ? (
            <p className="rounded-[var(--radius-md)] border border-border bg-surface-muted/60 p-4 text-sm text-muted">
              אין מספיק נתוני משמרות עדיין. הדוח יתמלא אחרי שיוגדרו משמרות ופעולות יקבלו `shiftId`.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {report.shifts.map((shift) => (
                <Link
                  key={shift.shiftId}
                  href={buildTeamReportHref(filterState, { shiftId: shift.shiftId })}
                  className="rounded-[var(--radius-md)] border border-border bg-white p-4 transition hover:border-brand/35"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-foreground">{shift.shiftName}</p>
                    <Badge variant={shift.shiftType === "manual" ? "outline" : shift.status === "needs_completion" ? "warning" : "secondary"}>
                      {shift.shiftType === "manual" ? "משמרת ידנית" : getDetectedShiftStatusLabel(shift.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted">
                    {shift.totalActions} פעולות מתועדות · {shift.actorCount} עובדים פעילים
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    משויכים: {shift.shiftType === "manual"
                      ? (scopedShifts.find((candidate) => candidate.id === shift.shiftId)?.assignedUserIds ?? []).length
                      : (detectedShiftsById.get(shift.shiftId)?.assignedUserIds ?? []).length} עובדים
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {(shift.shiftType === "manual"
                      ? scopedShifts.find((candidate) => candidate.id === shift.shiftId)?.assignedUserIds ?? []
                      : detectedShiftsById.get(shift.shiftId)?.assignedUserIds ?? [])
                      .slice(0, 4)
                      .map((userId) => userNames.get(userId) ?? "עובד לא זמין")
                      .join(" · ") || "אין עובדים משויכים"}
                  </p>
                  {shift.missingFields?.length ? (
                    <p className="mt-1 text-xs font-semibold text-amber-700">
                      חסר: {shift.missingFields.join(", ")}
                    </p>
                  ) : null}
                </Link>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs text-muted">
            פניות שנשארו פתוחות בסוף משמרת אינן מחושבות כרגע ללא snapshot סגירה אמין.
            {avgHandling !== null ? ` זמן טיפול ממוצע במסנן הנוכחי: ${avgHandling} דק'.` : ""}
            {avgResolution !== null ? ` זמן סגירה ממוצע: ${avgResolution} דק'.` : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>פעולות ללא שיוך משמרת ({unassignedShiftLogs.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {unassignedShiftLogs.length === 0 ? (
            <p className="text-sm text-muted">כל הפעולות במסנן הנוכחי משויכות למשמרת.</p>
          ) : (
            unassignedShiftLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="rounded-[var(--radius-md)] border border-border bg-white p-3 text-sm">
                <p className="font-bold text-foreground">{log.actorFullName ?? "משתמש מערכת"}</p>
                <p className="text-muted">
                  {actionLabels[log.action] ?? log.action} · {log.createdAt}
                  {typeof log.metadata?.shiftResolution === "string" ? ` · ${String(log.metadata.shiftResolution)}` : ""}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>פעולות אחרונות במסנן</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted">אין פעולות מתועדות במסנן הנוכחי.</p>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className="rounded-[var(--radius-md)] border border-border bg-white p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-foreground">{log.actorFullName ?? "משתמש מערכת"}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{actionLabels[log.action] ?? log.action}</Badge>
                    <Badge variant={log.detectedShiftId ? "warning" : log.shiftId ? "secondary" : "outline"}>
                      {getShiftLinkLabel({
                        shiftId: log.shiftId,
                        detectedShiftId: log.detectedShiftId,
                        detectedStatus: log.detectedShiftId ? detectedShiftsById.get(log.detectedShiftId)?.status : undefined,
                      })}
                    </Badge>
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {log.branchId ? branchNames.get(log.branchId) ?? "סניף לא ידוע" : "ללא סניף"} ·
                  {log.restroomId ? restroomNames.get(log.restroomId) ?? "אזור לא ידוע" : " ללא אזור"} ·
                  {log.shiftId
                    ? shiftNames.get(log.shiftId) ?? "משמרת לא ידועה"
                    : log.detectedShiftId
                      ? detectedShiftNames.get(log.detectedShiftId) ?? "משמרת שזוהתה"
                      : "ללא שיוך משמרת"}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
