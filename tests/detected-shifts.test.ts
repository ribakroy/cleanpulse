/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";

const store: Record<string, any[]> = {};

function resetStore() {
  for (const key of Object.keys(store)) {
    delete store[key];
  }
  store.detected_shifts = [];
  store.activity_logs = [];
  store.notification_logs = [];
  store.magic_login_tokens = [];
  store.system_settings = [];
  store.users = [];
  store.incidents = [];
}

function records(collection: string) {
  store[collection] ??= [];
  return store[collection];
}

const adapter = {
  create: vi.fn(async (collection: string, record: any) => {
    records(collection).push(record);
    return record;
  }),
  query: vi.fn(async (collection: string, filter: Record<string, any> = {}) => {
    return records(collection).filter((record) => {
      return Object.entries(filter).every(([key, value]) => {
        if (["includeInactive", "limit", "sortBy", "sortDirection"].includes(key)) return true;
        if (Array.isArray(value)) return value.includes(record[key]);
        return typeof value === "undefined" || record[key] === value;
      });
    }).slice(0, filter.limit ?? undefined);
  }),
  get: vi.fn(async (collection: string, id: string) => records(collection).find((record) => record.id === id) ?? null),
  update: vi.fn(async (collection: string, id: string, patch: any) => {
    const record = records(collection).find((candidate) => candidate.id === id);
    if (!record) throw new Error("not found");
    Object.assign(record, patch);
    return record;
  }),
  appendLog: vi.fn(async (collection: string, record: any) => {
    records(collection).push(record);
    return record;
  }),
};

vi.mock("@/lib/data/get-data-adapter", () => ({
  getDataAdapter: () => adapter,
}));

import { canUseMagicLoginTarget } from "@/lib/auth/magic-login";
import { detectOrUpdateShiftFromActivity } from "@/lib/shifts/detect-shift";
import { calculateTeamActivityReport } from "@/lib/reports/team";
import type { ActivityLogRecord, DetectedShiftRecord, SafeUserRecord } from "@/lib/data/types";

const worker: SafeUserRecord = {
  id: "worker_1",
  organizationId: "org_1",
  email: "worker@example.com",
  fullName: "דני עובד",
  role: "operations_worker",
  isActive: true,
  assignedRestroomIds: ["restroom_1"],
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
};

const secondWorker: SafeUserRecord = {
  ...worker,
  id: "worker_2",
  email: "worker2@example.com",
  fullName: "רות עובדת",
};

const areaManager: SafeUserRecord = {
  ...worker,
  id: "manager_1",
  email: "manager@example.com",
  fullName: "מנהל אזור",
  role: "area_manager",
  allowedRestroomIds: ["restroom_1"],
  assignedRestroomIds: [],
};

const owner: SafeUserRecord = {
  ...worker,
  id: "owner_1",
  email: "owner@example.com",
  fullName: "בעלים",
  role: "owner",
  assignedRestroomIds: [],
};

function log(overrides: Partial<ActivityLogRecord>): ActivityLogRecord {
  return {
    id: "activity_log_1",
    organizationId: "org_1",
    actorUserId: "worker_1",
    actorFullName: "דני עובד",
    actorRole: "operations_worker",
    incidentId: null,
    action: "status_in_progress",
    actionType: "status_in_progress",
    targetType: "incident",
    targetId: "incident_1",
    branchId: "branch_1",
    restroomId: "restroom_1",
    metadata: {},
    createdAt: "2026-06-12T08:20:00.000Z",
    ...overrides,
  };
}

describe("detected shift detection", () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    records("users").push(worker, secondWorker, owner, areaManager);
    records("system_settings").push({
      id: "email_domain_settings",
      appUrl: "http://localhost:3000",
      emailProvider: "mock",
      emailMode: "mock",
      fromName: "CleanPulse",
      fromEmail: "no-reply@cleanpulse.local",
      allowedTestRecipients: [],
      domainStatus: "not_configured",
      updatedByUserId: "owner_1",
      createdAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:00.000Z",
    });
  });

  it("creates a detected shift with known worker, branch and restroom when no manual shift is linked", async () => {
    const detected = await detectOrUpdateShiftFromActivity({
      user: worker,
      actionType: "status_in_progress",
      branchId: "branch_1",
      restroomId: "restroom_1",
      timestamp: "2026-06-12T08:00:00.000Z",
    });

    expect(detected).toMatchObject({
      organizationId: "org_1",
      branchId: "branch_1",
      restroomIds: ["restroom_1"],
      assignedUserIds: ["worker_1"],
      source: "detected",
      status: "needs_completion",
    });
    expect(detected.missingFields).toEqual(expect.arrayContaining(["managerUserId", "confirmedStartAt", "confirmedEndAt", "shiftName"]));
    expect(records("activity_logs").some((record) => record.action === "detected_shift_created")).toBe(true);
  });

  it("updates the same detected shift for another action in the same branch and time window", async () => {
    const first = await detectOrUpdateShiftFromActivity({
      user: worker,
      actionType: "status_in_progress",
      branchId: "branch_1",
      restroomId: "restroom_1",
      timestamp: "2026-06-12T08:00:00.000Z",
      requestCompletionEmail: false,
    });
    const second = await detectOrUpdateShiftFromActivity({
      user: worker,
      actionType: "status_resolved",
      branchId: "branch_1",
      restroomId: "restroom_1",
      timestamp: "2026-06-12T09:00:00.000Z",
      requestCompletionEmail: false,
    });

    expect(second.id).toBe(first.id);
    expect(records("detected_shifts")).toHaveLength(1);
    expect(second.inferredEndAt).toBe("2026-06-12T09:00:00.000Z");
  });

  it("adds another worker to the same detected shift in the same branch and window", async () => {
    const first = await detectOrUpdateShiftFromActivity({
      user: worker,
      actionType: "status_in_progress",
      branchId: "branch_1",
      restroomId: "restroom_1",
      timestamp: "2026-06-12T08:00:00.000Z",
      requestCompletionEmail: false,
    });
    const second = await detectOrUpdateShiftFromActivity({
      user: secondWorker,
      actionType: "worker_note",
      branchId: "branch_1",
      restroomId: "restroom_2",
      timestamp: "2026-06-12T09:00:00.000Z",
      requestCompletionEmail: false,
    });

    expect(second.id).toBe(first.id);
    expect(second.assignedUserIds).toEqual(expect.arrayContaining(["worker_1", "worker_2"]));
    expect(second.restroomIds).toEqual(expect.arrayContaining(["restroom_1", "restroom_2"]));
  });

  it("creates a new detected shift outside the detection window", async () => {
    await detectOrUpdateShiftFromActivity({
      user: worker,
      actionType: "status_in_progress",
      branchId: "branch_1",
      restroomId: "restroom_1",
      timestamp: "2026-06-12T08:00:00.000Z",
      requestCompletionEmail: false,
    });
    await detectOrUpdateShiftFromActivity({
      user: worker,
      actionType: "status_in_progress",
      branchId: "branch_1",
      restroomId: "restroom_1",
      timestamp: "2026-06-12T20:30:00.000Z",
      requestCompletionEmail: false,
    });

    expect(records("detected_shifts")).toHaveLength(2);
  });

  it("does not invent branch, restroom or manager when the activity lacks those facts", async () => {
    const detected = await detectOrUpdateShiftFromActivity({
      user: worker,
      actionType: "user_login",
      timestamp: "2026-06-12T08:00:00.000Z",
      requestCompletionEmail: false,
    });

    expect(detected.branchId).toBeUndefined();
    expect(detected.restroomIds ?? []).toEqual([]);
    expect(detected.managerUserId).toBeUndefined();
    expect(detected.missingFields).toEqual(expect.arrayContaining(["branchId", "restroomIds", "managerUserId"]));
  });

  it("uses area manager activity as manager only when that role actually acted", async () => {
    const detected = await detectOrUpdateShiftFromActivity({
      user: areaManager,
      actionType: "status_acknowledged",
      branchId: "branch_1",
      restroomId: "restroom_1",
      timestamp: "2026-06-12T08:00:00.000Z",
      requestCompletionEmail: false,
    });

    expect(detected.managerUserId).toBe("manager_1");
    expect(detected.missingFields).not.toContain("managerUserId");
  });

  it("generates a mock completion notification and hashed magic link target", async () => {
    const detected = await detectOrUpdateShiftFromActivity({
      user: worker,
      actionType: "status_in_progress",
      branchId: "branch_1",
      restroomId: "restroom_1",
      timestamp: "2026-06-12T08:00:00.000Z",
    });

    expect(records("notification_logs")[0]).toMatchObject({
      organizationId: "org_1",
      targetType: "detected_shift",
      targetId: detected.id,
      status: "mock_sent",
    });
    expect(records("magic_login_tokens")[0]).toMatchObject({
      userId: "owner_1",
      purpose: "shift_completion_required",
      targetPath: `/admin/shifts?detectedShiftId=${detected.id}`,
    });
    expect(JSON.stringify(records("notification_logs"))).not.toContain("token=");
  });

  it("allows scoped area manager magic links only for detected shifts in scope", async () => {
    const allowed: DetectedShiftRecord = {
      id: "detected_allowed",
      organizationId: "org_1",
      branchId: "branch_1",
      restroomIds: ["restroom_1"],
      assignedUserIds: ["worker_1"],
      source: "detected",
      status: "needs_completion",
      missingFields: ["confirmedStartAt"],
      confidence: "medium",
      createdAt: "2026-06-12T08:00:00.000Z",
      updatedAt: "2026-06-12T08:00:00.000Z",
    };
    const blocked = {
      ...allowed,
      id: "detected_blocked",
      restroomIds: ["restroom_2"],
    };
    records("detected_shifts").push(allowed, blocked);

    await expect(canUseMagicLoginTarget(areaManager, "/admin/shifts?detectedShiftId=detected_allowed")).resolves.toBe(true);
    await expect(canUseMagicLoginTarget(areaManager, "/admin/shifts?detectedShiftId=detected_blocked")).resolves.toBe(false);
  });

  it("reports detected, needs-completion and no-shift activity without treating detected shifts as manual shifts", () => {
    const detectedShift = records("detected_shifts")[0] ?? {
      id: "detected_1",
      organizationId: "org_1",
      shiftName: "זוהתה בוקר",
      source: "detected",
      status: "needs_completion",
      missingFields: ["managerUserId"],
      createdAt: "2026-06-12T08:00:00.000Z",
      updatedAt: "2026-06-12T08:00:00.000Z",
    };
    const report = calculateTeamActivityReport({
      users: [worker],
      incidents: [],
      activityLogs: [
        log({ id: "detected_log", detectedShiftId: detectedShift.id, shiftId: undefined }),
        log({ id: "no_shift", detectedShiftId: undefined, shiftId: undefined, action: "worker_note" }),
      ],
      detectedShifts: [detectedShift],
      shifts: [],
    });

    expect(report.members[0]).toMatchObject({
      detectedShiftIds: [detectedShift.id],
      shiftIds: [],
    });
    expect(report.shifts[0]).toMatchObject({
      shiftId: detectedShift.id,
      shiftType: "detected",
      status: "needs_completion",
      missingFields: ["managerUserId"],
    });
  });
});
