import { describe, expect, it } from "vitest";
import { calculateTeamActivityReport } from "@/lib/reports/team";
import type { ActivityLogRecord, IncidentRecord, SafeUserRecord, ShiftRecord } from "@/lib/data/types";

const user: SafeUserRecord = {
  id: "user_1",
  organizationId: "org_1",
  email: "worker@example.com",
  fullName: "דני כהן",
  role: "operations_worker",
  isActive: true,
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
};

const otherUser: SafeUserRecord = {
  ...user,
  id: "user_2",
  email: "other@example.com",
  fullName: "רות לוי",
};

const shift: ShiftRecord = {
  id: "shift_1",
  organizationId: "org_1",
  branchId: "branch_1",
  name: "בוקר",
  startsAt: "08:00",
  endsAt: "14:00",
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  isActive: true,
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
};

const incident: IncidentRecord = {
  id: "incident_1",
  organizationId: "org_1",
  branchId: "branch_1",
  restroomId: "restroom_1",
  screenId: "screen_1",
  issueTypeId: null,
  issueKey: "not_clean",
  rating: null,
  status: "resolved",
  priority: "medium",
  customerNote: null,
  openedAt: "2026-06-12T08:00:00.000Z",
  acknowledgedAt: null,
  inProgressAt: "2026-06-12T08:05:00.000Z",
  resolvedAt: "2026-06-12T08:20:00.000Z",
  dismissedAt: null,
  assignedToUserId: null,
  resolvedByUserId: "user_1",
  resolutionNote: null,
  source: "qr",
  createdAt: "2026-06-12T08:00:00.000Z",
  updatedAt: "2026-06-12T08:20:00.000Z",
};

function log(overrides: Partial<ActivityLogRecord>): ActivityLogRecord {
  return {
    id: "activity_log_1",
    organizationId: "org_1",
    actorUserId: "user_1",
    actorFullName: "דני כהן",
    actorRole: "operations_worker",
    incidentId: "incident_1",
    action: "status_resolved",
    actionType: "status_resolved",
    targetType: "incident",
    targetId: "incident_1",
    restroomId: "restroom_1",
    branchId: "branch_1",
    metadata: {},
    createdAt: "2026-06-12T08:20:00.000Z",
    ...overrides,
  };
}

describe("team activity report", () => {
  it("aggregates started treatments, completed treatments, resets, notes, and duration averages by actor", () => {
    const report = calculateTeamActivityReport({
      users: [user],
      incidents: [incident],
      activityLogs: [
        log({ id: "started", action: "status_in_progress", createdAt: "2026-06-12T08:05:00.000Z" }),
        log({ id: "resolved", action: "status_resolved" }),
        log({ id: "reset", action: "restroom_reset" }),
        log({ id: "note", action: "worker_note" }),
      ],
    });

    expect(report.members).toHaveLength(1);
    expect(report.members[0]).toMatchObject({
      actorFullName: "דני כהן",
      totalActions: 4,
      startedIncidents: 1,
      resolvedIncidents: 1,
      restroomResets: 1,
      notes: 1,
      avgResponseMinutes: 5,
      avgHandlingMinutes: 15,
      avgResolutionMinutes: 20,
      branchIds: ["branch_1"],
      restroomIds: ["restroom_1"],
    });
  });

  it("returns empty shift summaries when no shiftId exists", () => {
    const report = calculateTeamActivityReport({
      users: [user],
      incidents: [incident],
      activityLogs: [log({ id: "resolved", shiftId: undefined })],
      shifts: [],
    });

    expect(report.shifts).toEqual([]);
  });

  it("aggregates shift activity with distinct actor count", () => {
    const report = calculateTeamActivityReport({
      users: [user, otherUser],
      incidents: [incident],
      activityLogs: [
        log({ id: "one", shiftId: "shift_1" }),
        log({
          id: "two",
          actorUserId: "user_2",
          actorFullName: "רות לוי",
          shiftId: "shift_1",
        }),
      ],
      shifts: [shift],
    });

    expect(report.shifts).toEqual([
      {
        shiftId: "shift_1",
        shiftName: "בוקר",
        totalActions: 2,
        actorCount: 2,
      },
    ]);
  });
});
