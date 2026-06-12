import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBusinessUserAction } from "@/app/(admin)/admin/users/actions";
import { resetRestroomIncidentsAction, startInProgressIncidentAction } from "@/app/actions/incidents";
import { requireUser } from "@/lib/auth/session";
import { createActivityLog } from "@/lib/data/repositories/activity-logs";
import { getIncidentById, updateIncidentStatus } from "@/lib/data/repositories/incidents";
import { createUser } from "@/lib/data/repositories/users";
import type { IncidentRecord, SafeUserRecord } from "@/lib/data/types";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  createActivityLog: vi.fn(),
  getIncidentById: vi.fn(),
  updateIncidentStatus: vi.fn(),
  resolveOpenIncidentsForRestroom: vi.fn(),
  createUser: vi.fn(),
  getUserByEmailForAuth: vi.fn(),
  getUserById: vi.fn(),
  updateUser: vi.fn(),
  listBranchesByOrganization: vi.fn(),
  listRestroomsByOrganization: vi.fn(),
  getShiftById: vi.fn(),
  listShiftsByOrganization: vi.fn(),
  detectOrUpdateShiftFromActivity: vi.fn(),
  attachActivityLogToDetectedShift: vi.fn(),
  revalidatePath: vi.fn(),
  bcryptHash: vi.fn(),
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: mocks.bcryptHash,
  },
  hash: mocks.bcryptHash,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/auth/session", () => ({
  requireUser: mocks.requireUser,
}));

vi.mock("@/lib/data/repositories/activity-logs", () => ({
  createActivityLog: mocks.createActivityLog,
}));

vi.mock("@/lib/data/repositories/incidents", () => ({
  getIncidentById: mocks.getIncidentById,
  updateIncidentStatus: mocks.updateIncidentStatus,
  resolveOpenIncidentsForRestroom: mocks.resolveOpenIncidentsForRestroom,
}));

vi.mock("@/lib/data/repositories/users", () => ({
  createUser: mocks.createUser,
  getUserByEmailForAuth: mocks.getUserByEmailForAuth,
  getUserById: mocks.getUserById,
  updateUser: mocks.updateUser,
}));

vi.mock("@/lib/data/repositories/branches", () => ({
  listBranchesByOrganization: mocks.listBranchesByOrganization,
}));

vi.mock("@/lib/data/repositories/restrooms", () => ({
  listRestroomsByOrganization: mocks.listRestroomsByOrganization,
}));

vi.mock("@/lib/data/repositories/shifts", () => ({
  getShiftById: mocks.getShiftById,
  listShiftsByOrganization: mocks.listShiftsByOrganization,
}));

vi.mock("@/lib/shifts/detect-shift", () => ({
  detectOrUpdateShiftFromActivity: mocks.detectOrUpdateShiftFromActivity,
}));

vi.mock("@/lib/data/repositories/detected-shifts", () => ({
  attachActivityLogToDetectedShift: mocks.attachActivityLogToDetectedShift,
}));

const owner: SafeUserRecord = {
  id: "owner_1",
  organizationId: "org_1",
  email: "owner@example.com",
  fullName: "בעלים",
  role: "owner",
  isActive: true,
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
};

const worker: SafeUserRecord = {
  id: "worker_1",
  organizationId: "org_1",
  email: "worker@example.com",
  fullName: "דני כהן",
  role: "operations_worker",
  isActive: true,
  assignedRestroomIds: ["restroom_1"],
  defaultShiftId: "shift_1",
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
};

function incident(overrides: Partial<IncidentRecord>): IncidentRecord {
  return {
    id: "incident_1",
    organizationId: "org_1",
    branchId: "branch_1",
    restroomId: "restroom_1",
    screenId: "screen_1",
    issueTypeId: null,
    issueKey: "not_clean",
    rating: null,
    status: "open",
    priority: "medium",
    customerNote: null,
    openedAt: "2026-06-12T08:00:00.000Z",
    acknowledgedAt: null,
    inProgressAt: null,
    resolvedAt: null,
    dismissedAt: null,
    assignedToUserId: null,
    resolvedByUserId: null,
    resolutionNote: null,
    source: "qr",
    createdAt: "2026-06-12T08:00:00.000Z",
    updatedAt: "2026-06-12T08:00:00.000Z",
    ...overrides,
  };
}

function userForm(role: string) {
  const formData = new FormData();
  formData.set("fullName", "משתמש בדיקה");
  formData.set("email", "new@example.com");
  formData.set("role", role);
  formData.set("temporaryPassword", "TempPass123!");
  return formData;
}

describe("server action authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue(owner);
    mocks.bcryptHash.mockResolvedValue("hash");
    mocks.createActivityLog.mockResolvedValue({ id: "activity_log_1" });
    mocks.updateIncidentStatus.mockResolvedValue({});
    mocks.resolveOpenIncidentsForRestroom.mockResolvedValue({ closedCount: 0, closedIncidentIds: [], resetAt: "2026-06-12T08:00:00.000Z" });
    mocks.listShiftsByOrganization.mockResolvedValue([]);
    mocks.detectOrUpdateShiftFromActivity.mockResolvedValue({
      id: "detected_shift_1",
      status: "needs_completion",
    });
    mocks.attachActivityLogToDetectedShift.mockResolvedValue({});
  });

  it("blocks business admins from creating super_admin users", async () => {
    const result = await createBusinessUserAction({ ok: false, message: null }, userForm("super_admin"));

    expect(result.ok).toBe(false);
    expect(result.message).toBe("תפקיד לא תקין");
    expect(createUser).not.toHaveBeenCalled();
    expect(createActivityLog).not.toHaveBeenCalled();
  });

  it("blocks an operations worker from updating an incident outside assigned scope", async () => {
    vi.mocked(requireUser).mockResolvedValue(worker);
    vi.mocked(getIncidentById).mockResolvedValue(incident({ restroomId: "restroom_2", branchId: "branch_2" }));

    await expect(startInProgressIncidentAction("incident_1")).rejects.toThrow("אין הרשאה לעדכן את סטטוס הדיווח");

    expect(updateIncidentStatus).not.toHaveBeenCalled();
    expect(createActivityLog).not.toHaveBeenCalled();
  });

  it("blocks an operations worker from resetting a restroom outside assigned scope", async () => {
    vi.mocked(requireUser).mockResolvedValue(worker);
    vi.mocked(getIncidentById).mockResolvedValue(incident({ restroomId: "restroom_2", branchId: "branch_2" }));

    await expect(resetRestroomIncidentsAction("incident_1")).rejects.toThrow("אין הרשאה לאפס את מצב השירותים");

    expect(mocks.resolveOpenIncidentsForRestroom).not.toHaveBeenCalled();
    expect(createActivityLog).not.toHaveBeenCalled();
  });

  it("logs actor identity and matching shift for allowed worker updates", async () => {
    vi.mocked(requireUser).mockResolvedValue(worker);
    vi.mocked(getIncidentById).mockResolvedValue(incident({}));
    mocks.listShiftsByOrganization.mockResolvedValue([
      {
        id: "shift_1",
        organizationId: "org_1",
        branchId: "branch_1",
        restroomIds: ["restroom_1"],
        assignedUserIds: ["worker_1"],
        name: "כל היום",
        startsAt: "00:00",
        endsAt: "23:59",
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
        createdAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:00.000Z",
      },
    ]);

    await startInProgressIncidentAction("incident_1");

    expect(updateIncidentStatus).toHaveBeenCalledWith(expect.objectContaining({
      actorUserId: "worker_1",
      status: "in_progress",
    }));
    expect(createActivityLog).toHaveBeenCalledWith(expect.objectContaining({
      actorUserId: "worker_1",
      actorFullName: "דני כהן",
      actorRole: "operations_worker",
      action: "status_in_progress",
      shiftId: "shift_1",
      metadata: expect.objectContaining({
        shiftResolution: "matched",
      }),
    }));
    expect(mocks.detectOrUpdateShiftFromActivity).not.toHaveBeenCalled();
  });

  it("uses detected shift when worker acts outside matching manual shift", async () => {
    vi.mocked(requireUser).mockResolvedValue(worker);
    vi.mocked(getIncidentById).mockResolvedValue(incident({}));
    mocks.listShiftsByOrganization.mockResolvedValue([
      {
        id: "shift_1",
        organizationId: "org_1",
        branchId: "branch_2",
        restroomIds: ["restroom_2"],
        assignedUserIds: ["worker_1"],
        name: "אזור אחר",
        startsAt: "00:00",
        endsAt: "23:59",
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
        createdAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:00.000Z",
      },
    ]);

    await startInProgressIncidentAction("incident_1");

    expect(mocks.detectOrUpdateShiftFromActivity).toHaveBeenCalledWith(expect.objectContaining({
      user: worker,
      actionType: "status_in_progress",
      branchId: "branch_1",
      restroomId: "restroom_1",
    }));
    expect(createActivityLog).toHaveBeenCalledWith(expect.objectContaining({
      shiftId: undefined,
      detectedShiftId: "detected_shift_1",
      metadata: expect.objectContaining({
        shiftResolution: "outside_shift",
        shiftLinkType: "detected",
        detectedShiftStatus: "needs_completion",
      }),
    }));
    expect(mocks.attachActivityLogToDetectedShift).toHaveBeenCalledWith(
      "org_1",
      "detected_shift_1",
      "activity_log_1",
    );
  });
});
