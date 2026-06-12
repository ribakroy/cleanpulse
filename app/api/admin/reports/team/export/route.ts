import { type NextRequest } from "next/server";
import {
  canViewBranch,
  canViewIncident,
  canViewReports,
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
import type { UserRole } from "@/types/domain";
import { escapeCsvValue } from "@/lib/reports/csv";
import { filterIncidents } from "@/lib/reports/metrics";

const roleFilterOptions: UserRole[] = ["owner", "admin", "area_manager", "operations_worker", "manager", "cleaner"];
const shiftLinkOptions = new Set(["confirmed", "detected", "needs_completion", "no_shift"]);

function normalizeReportDate(value: string | null): string {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return trimmed;

  const localMatch = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!localMatch) return "";

  return `${localMatch[3]}-${localMatch[2]!.padStart(2, "0")}-${localMatch[1]!.padStart(2, "0")}`;
}

function isLogInDateRange(logDate: string, startDate: string, endDate: string) {
  const timestamp = new Date(logDate).getTime();

  if (startDate && timestamp < new Date(`${startDate}T00:00:00`).getTime()) return false;
  if (endDate && timestamp > new Date(`${endDate}T23:59:59`).getTime()) return false;

  return true;
}

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

function getDetectedShiftStatusLabel(status: string | undefined) {
  if (status === "confirmed") return "משמרת שזוהתה ואושרה";
  if (status === "needs_completion") return "משמרת שזוהתה - דורשת השלמה";
  if (status === "dismissed") return "משמרת שזוהתה - נדחתה";
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

export async function GET(request: NextRequest) {
  const user = await requireUser();

  if (!canViewReports(user)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { searchParams } = new URL(request.url);
  const startDate = normalizeReportDate(searchParams.get("startDate"));
  const endDate = normalizeReportDate(searchParams.get("endDate"));
  const filterBranch = searchParams.get("branchId") || "";
  const filterRestroom = searchParams.get("restroomId") || "";
  const filterUser = searchParams.get("userId") || "";
  const filterRole = roleFilterOptions.includes(searchParams.get("role") as UserRole) ? searchParams.get("role") as UserRole : "";
  const filterShift = searchParams.get("shiftId") || "";
  const filterShiftLink = shiftLinkOptions.has(searchParams.get("shiftLink") || "") ? searchParams.get("shiftLink") || "" : "";
  const filterAction = searchParams.get("action") || "";
  const filterManager = searchParams.get("managerId") || "";

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
  const visibleBranchIds = new Set(branches.map((branch) => branch.id));
  const visibleRestroomIds = new Set(restrooms.map((restroom) => restroom.id));
  const branchNames = new Map(branches.map((branch) => [branch.id, branch.name] as const));
  const restroomNames = new Map(restrooms.map((restroom) => [restroom.id, restroom.name] as const));
  const shiftNames = new Map(shifts.filter((shift) => !shift.branchId || visibleBranchIds.has(shift.branchId)).map((shift) => [shift.id, shift.name] as const));
  const scopedDetectedShifts = detectedShifts.filter((shift) => {
    if (shift.branchId && !visibleBranchIds.has(shift.branchId)) return false;
    if (shift.restroomIds?.length && shift.restroomIds.some((restroomId) => !visibleRestroomIds.has(restroomId))) return false;
    return Boolean(shift.branchId || shift.restroomIds?.length || isOrganizationOwner(user));
  });
  const detectedShiftsById = new Map(scopedDetectedShifts.map((shift) => [shift.id, shift] as const));
  const detectedShiftNames = new Map(scopedDetectedShifts.map((shift) => [shift.id, shift.shiftName ?? "משמרת שזוהתה"] as const));
  const visibleDetectedShiftIds = new Set(scopedDetectedShifts.map((shift) => shift.id));
  const usersById = new Map(users.map((reportUser) => [reportUser.id, reportUser] as const));
  const incidentsById = new Map(scopedIncidents.map((incident) => [incident.id, incident] as const));
  const filteredIncidents = filterIncidents(scopedIncidents, {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    branchId: filterBranch || undefined,
    restroomId: filterRestroom || undefined,
  });
  const incidentIds = new Set(filteredIncidents.map((incident) => incident.id));
  const managerOptions = users.filter((candidate) =>
    (candidate.role === "area_manager" || candidate.role === "manager") &&
    (isOrganizationOwner(user) || candidate.id === user.id),
  );
  const selectedManager = managerOptions.find((candidate) => candidate.id === filterManager) ?? null;

  const logs = activityLogs
    .filter((log) => {
      if (!isLogInDateRange(log.createdAt, startDate, endDate)) return false;
      if (log.incidentId) return incidentIds.has(log.incidentId);
      if (log.detectedShiftId && !visibleDetectedShiftIds.has(log.detectedShiftId)) return false;
      if (log.restroomId && !visibleRestroomIds.has(log.restroomId)) return false;
      if (log.branchId && !visibleBranchIds.has(log.branchId)) return false;
      if (filterRestroom && log.restroomId !== filterRestroom) return false;
      if (filterBranch && log.branchId !== filterBranch) return false;
      return Boolean(log.branchId || log.restroomId || log.detectedShiftId);
    })
    .filter((log) => {
      if (!selectedManager) return true;
      if (log.incidentId) {
        const incident = incidentsById.get(log.incidentId);
        return incident ? canViewIncident(selectedManager, incident) : false;
      }
      if (log.restroomId) {
        const restroom = allRestrooms.find((candidate) => candidate.id === log.restroomId);
        return restroom ? canViewRestroom(selectedManager, restroom) : false;
      }
      if (log.branchId) return canViewBranch(selectedManager, log.branchId);
      return false;
    })
    .filter((log) => {
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

  const headers = ["שם עובד", "תפקיד", "משמרת", "סוג שיוך", "סניף", "אזור שירותים", "סוג פעולה", "זמן", "שיוך משמרת"];
  const rows = [headers.map(escapeCsvValue).join(",")];

  for (const log of logs) {
    const actorRole = log.actorRole ?? (log.actorUserId ? usersById.get(log.actorUserId)?.role : undefined);
    rows.push([
      log.actorFullName ?? "משתמש מערכת",
      actorRole ? formatRoleLabel(actorRole as UserRole) : "לא זמין",
      log.shiftId
        ? shiftNames.get(log.shiftId) ?? "משמרת לא זמינה"
        : log.detectedShiftId
          ? detectedShiftNames.get(log.detectedShiftId) ?? "משמרת שזוהתה"
          : "ללא שיוך משמרת",
      getShiftLinkLabel({
        shiftId: log.shiftId,
        detectedShiftId: log.detectedShiftId,
        detectedStatus: log.detectedShiftId ? detectedShiftsById.get(log.detectedShiftId)?.status : undefined,
      }),
      log.branchId ? branchNames.get(log.branchId) ?? "סניף לא זמין" : "",
      log.restroomId ? restroomNames.get(log.restroomId) ?? "אזור לא זמין" : "",
      actionLabels[log.action] ?? log.action,
      log.createdAt,
      typeof log.metadata?.shiftResolution === "string" ? String(log.metadata.shiftResolution) : "",
    ].map(escapeCsvValue).join(","));
  }

  return new Response(`\uFEFF${rows.join("\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=team_activity_report.csv",
    },
  });
}
