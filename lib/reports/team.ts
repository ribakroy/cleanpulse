import type { ActivityLogRecord, DetectedShiftRecord, IncidentRecord, SafeUserRecord, ShiftRecord } from "@/lib/data/types";
import { getDurationMinutes } from "@/lib/reports/metrics";

export type TeamMemberActivitySummary = {
  actorKey: string;
  actorFullName: string;
  actorRole: string;
  totalActions: number;
  startedIncidents: number;
  resolvedIncidents: number;
  restroomResets: number;
  notes: number;
  avgResponseMinutes: number | null;
  avgHandlingMinutes: number | null;
  avgResolutionMinutes: number | null;
  branchIds: string[];
  restroomIds: string[];
  shiftIds: string[];
  detectedShiftIds: string[];
};

export type ShiftActivitySummary = {
  shiftId: string;
  shiftName: string;
  shiftType: "manual" | "detected";
  status?: string | undefined;
  missingFields?: string[] | undefined;
  totalActions: number;
  actorCount: number;
};

export type TeamActivityReport = {
  members: TeamMemberActivitySummary[];
  shifts: ShiftActivitySummary[];
};

function getActorKey(log: ActivityLogRecord) {
  return log.actorUserId ?? log.actorFullName ?? "system";
}

function getActorName(log: ActivityLogRecord, usersById: Map<string, SafeUserRecord>) {
  if (log.actorFullName) {
    return log.actorFullName;
  }

  if (log.actorUserId) {
    return usersById.get(log.actorUserId)?.fullName ?? "לא זמין";
  }

  return "משתמש מערכת";
}

function getActorRole(log: ActivityLogRecord, usersById: Map<string, SafeUserRecord>) {
  if (log.actorRole) {
    return log.actorRole;
  }

  if (log.actorUserId) {
    return usersById.get(log.actorUserId)?.role ?? "לא זמין";
  }

  return "system";
}

export function calculateTeamActivityReport(input: {
  users: SafeUserRecord[];
  incidents: IncidentRecord[];
  activityLogs: ActivityLogRecord[];
  shifts?: ShiftRecord[] | undefined;
  detectedShifts?: DetectedShiftRecord[] | undefined;
}): TeamActivityReport {
  const usersById = new Map(input.users.map((user) => [user.id, user] as const));
  const incidentsById = new Map(input.incidents.map((incident) => [incident.id, incident] as const));
  const shiftsById = new Map((input.shifts ?? []).map((shift) => [shift.id, shift] as const));
  const detectedShiftsById = new Map((input.detectedShifts ?? []).map((shift) => [shift.id, shift] as const));
  const summaries = new Map<string, TeamMemberActivitySummary & {
    responseMinutes: number[];
    handlingMinutes: number[];
    resolutionMinutes: number[];
  }>();
  const shiftCounts = new Map<string, {
    id: string;
    type: "manual" | "detected";
    totalActions: number;
    actorKeys: Set<string>;
  }>();

  for (const log of input.activityLogs) {
    if (!log.actorUserId && !log.actorFullName) {
      continue;
    }

    const actorKey = getActorKey(log);
    const current = summaries.get(actorKey) ?? {
      actorKey,
      actorFullName: getActorName(log, usersById),
      actorRole: getActorRole(log, usersById),
      totalActions: 0,
      startedIncidents: 0,
      resolvedIncidents: 0,
      restroomResets: 0,
      notes: 0,
      avgResponseMinutes: null,
      avgHandlingMinutes: null,
      avgResolutionMinutes: null,
      branchIds: [],
      restroomIds: [],
      shiftIds: [],
      detectedShiftIds: [],
      responseMinutes: [],
      handlingMinutes: [],
      resolutionMinutes: [],
    };

    current.totalActions += 1;

    if (log.action === "status_in_progress") {
      current.startedIncidents += 1;
      const incident = log.incidentId ? incidentsById.get(log.incidentId) : null;
      const responseDuration = incident ? getDurationMinutes(incident.openedAt, incident.inProgressAt ?? log.createdAt) : null;
      if (responseDuration !== null) {
        current.responseMinutes.push(responseDuration);
      }
    }

    if (log.action === "status_resolved") {
      current.resolvedIncidents += 1;
      const incident = log.incidentId ? incidentsById.get(log.incidentId) : null;
      const resolutionDuration = incident ? getDurationMinutes(incident.openedAt, incident.resolvedAt || incident.dismissedAt) : null;
      const handlingDuration = incident ? getDurationMinutes(incident.inProgressAt ?? incident.openedAt, incident.resolvedAt || incident.dismissedAt) : null;
      if (resolutionDuration !== null) {
        current.resolutionMinutes.push(resolutionDuration);
      }
      if (handlingDuration !== null) {
        current.handlingMinutes.push(handlingDuration);
      }
    }

    if (log.action === "restroom_reset") {
      current.restroomResets += 1;
    }

    if (log.action === "worker_note") {
      current.notes += 1;
    }

    if (log.branchId && !current.branchIds.includes(log.branchId)) {
      current.branchIds.push(log.branchId);
    }

    if (log.restroomId && !current.restroomIds.includes(log.restroomId)) {
      current.restroomIds.push(log.restroomId);
    }

    if (log.shiftId) {
      if (!current.shiftIds.includes(log.shiftId)) {
        current.shiftIds.push(log.shiftId);
      }
      const shiftKey = `manual:${log.shiftId}`;
      const shiftSummary = shiftCounts.get(shiftKey) ?? {
        id: log.shiftId,
        type: "manual" as const,
        totalActions: 0,
        actorKeys: new Set<string>(),
      };
      shiftSummary.totalActions += 1;
      shiftSummary.actorKeys.add(actorKey);
      shiftCounts.set(shiftKey, shiftSummary);
    }

    if (log.detectedShiftId) {
      if (!current.detectedShiftIds.includes(log.detectedShiftId)) {
        current.detectedShiftIds.push(log.detectedShiftId);
      }
      const shiftKey = `detected:${log.detectedShiftId}`;
      const shiftSummary = shiftCounts.get(shiftKey) ?? {
        id: log.detectedShiftId,
        type: "detected" as const,
        totalActions: 0,
        actorKeys: new Set<string>(),
      };
      shiftSummary.totalActions += 1;
      shiftSummary.actorKeys.add(actorKey);
      shiftCounts.set(shiftKey, shiftSummary);
    }

    summaries.set(actorKey, current);
  }

  const members = Array.from(summaries.values())
    .map(({ responseMinutes, handlingMinutes, resolutionMinutes, ...summary }) => ({
      ...summary,
      avgResponseMinutes:
        responseMinutes.length > 0
          ? Math.round(responseMinutes.reduce((total, value) => total + value, 0) / responseMinutes.length)
          : null,
      avgHandlingMinutes:
        handlingMinutes.length > 0
          ? Math.round(handlingMinutes.reduce((total, value) => total + value, 0) / handlingMinutes.length)
          : null,
      avgResolutionMinutes:
        resolutionMinutes.length > 0
          ? Math.round(resolutionMinutes.reduce((total, value) => total + value, 0) / resolutionMinutes.length)
          : null,
    }))
    .sort((left, right) => right.resolvedIncidents - left.resolvedIncidents || right.totalActions - left.totalActions);

  const shifts = Array.from(shiftCounts.values())
    .map((shiftSummary) => ({
      shiftId: shiftSummary.id,
      shiftName: shiftSummary.type === "manual"
        ? shiftsById.get(shiftSummary.id)?.name ?? "משמרת לא זמינה"
        : detectedShiftsById.get(shiftSummary.id)?.shiftName ?? "משמרת שזוהתה",
      shiftType: shiftSummary.type,
      status: shiftSummary.type === "detected" ? detectedShiftsById.get(shiftSummary.id)?.status : undefined,
      missingFields: shiftSummary.type === "detected" ? detectedShiftsById.get(shiftSummary.id)?.missingFields : undefined,
      totalActions: shiftSummary.totalActions,
      actorCount: shiftSummary.actorKeys.size,
    }))
    .sort((left, right) => right.totalActions - left.totalActions);

  return {
    members,
    shifts,
  };
}
