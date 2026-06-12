import { describe, expect, it, beforeEach, vi } from "vitest";
import { GET } from "@/app/api/admin/reports/team/export/route";
import type {
  ActivityLogRecord,
  BranchRecord,
  IncidentRecord,
  RestroomRecord,
  SafeUserRecord,
  ShiftRecord,
} from "@/lib/data/types";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  listActivityLogsByOrganization: vi.fn(),
  listBranchesByOrganization: vi.fn(),
  listIncidentsByOrganization: vi.fn(),
  listRestroomsByOrganization: vi.fn(),
  listShiftsByOrganization: vi.fn(),
  listUsersByOrganization: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  requireUser: mocks.requireUser,
}));

vi.mock("@/lib/data/repositories/activity-logs", () => ({
  listActivityLogsByOrganization: mocks.listActivityLogsByOrganization,
}));

vi.mock("@/lib/data/repositories/branches", () => ({
  listBranchesByOrganization: mocks.listBranchesByOrganization,
}));

vi.mock("@/lib/data/repositories/incidents", () => ({
  listIncidentsByOrganization: mocks.listIncidentsByOrganization,
}));

vi.mock("@/lib/data/repositories/restrooms", () => ({
  listRestroomsByOrganization: mocks.listRestroomsByOrganization,
}));

vi.mock("@/lib/data/repositories/shifts", () => ({
  listShiftsByOrganization: mocks.listShiftsByOrganization,
}));

vi.mock("@/lib/data/repositories/users", () => ({
  listUsersByOrganization: mocks.listUsersByOrganization,
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

const manager: SafeUserRecord = {
  ...owner,
  id: "manager_1",
  email: "manager@example.com",
  fullName: "מנהל אזור",
  role: "area_manager",
  allowedRestroomIds: ["restroom_1"],
};

const worker: SafeUserRecord = {
  ...owner,
  id: "worker_1",
  email: "worker@example.com",
  fullName: "דני כהן",
  role: "operations_worker",
};

const hiddenWorker: SafeUserRecord = {
  ...owner,
  id: "worker_2",
  email: "hidden@example.com",
  fullName: "=רות לוי",
  role: "operations_worker",
};

const branches: BranchRecord[] = [
  {
    id: "branch_1",
    organizationId: "org_1",
    name: "רוטשילד",
    address: "",
    city: "",
    isActive: true,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "branch_2",
    organizationId: "org_1",
    name: "סניף מוסתר",
    address: "",
    city: "",
    isActive: true,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  },
];

const restrooms: RestroomRecord[] = [
  {
    id: "restroom_1",
    organizationId: "org_1",
    branchId: "branch_1",
    name: "שירותי קומה 1",
    floor: "1",
    areaDescription: "",
    isActive: true,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "restroom_2",
    organizationId: "org_1",
    branchId: "branch_2",
    name: "שירותים מוסתרים",
    floor: "2",
    areaDescription: "",
    isActive: true,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  },
];

const shifts: ShiftRecord[] = [
  {
    id: "shift_1",
    organizationId: "org_1",
    branchId: "branch_1",
    restroomIds: ["restroom_1"],
    assignedUserIds: ["worker_1"],
    name: "בוקר",
    startsAt: "08:00",
    endsAt: "14:00",
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "shift_2",
    organizationId: "org_1",
    branchId: "branch_2",
    restroomIds: ["restroom_2"],
    assignedUserIds: ["worker_2"],
    name: "מוסתרת",
    startsAt: "08:00",
    endsAt: "14:00",
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  },
];

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
    status: "resolved",
    priority: "medium",
    customerNote: null,
    openedAt: "2026-06-12T08:00:00.000Z",
    acknowledgedAt: null,
    inProgressAt: "2026-06-12T08:05:00.000Z",
    resolvedAt: "2026-06-12T08:20:00.000Z",
    dismissedAt: null,
    assignedToUserId: null,
    resolvedByUserId: null,
    resolutionNote: null,
    source: "qr",
    createdAt: "2026-06-12T08:00:00.000Z",
    updatedAt: "2026-06-12T08:20:00.000Z",
    ...overrides,
  };
}

function activityLog(overrides: Partial<ActivityLogRecord>): ActivityLogRecord {
  return {
    id: "log_1",
    organizationId: "org_1",
    actorUserId: "worker_1",
    actorFullName: "דני כהן",
    actorRole: "operations_worker",
    incidentId: "incident_1",
    action: "status_resolved",
    actionType: "status_resolved",
    targetType: "incident",
    targetId: "incident_1",
    restroomId: "restroom_1",
    branchId: "branch_1",
    shiftId: "shift_1",
    metadata: { shiftResolution: "matched" },
    createdAt: "2026-06-12T08:20:00.000Z",
    ...overrides,
  };
}

async function exportCsv(url: string) {
  const response = await GET(new Request(url) as never);
  return response.text();
}

describe("team report CSV export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue(owner);
    mocks.listBranchesByOrganization.mockResolvedValue(branches);
    mocks.listRestroomsByOrganization.mockResolvedValue(restrooms);
    mocks.listShiftsByOrganization.mockResolvedValue(shifts);
    mocks.listUsersByOrganization.mockResolvedValue([owner, manager, worker, hiddenWorker]);
    mocks.listIncidentsByOrganization.mockResolvedValue([
      incident({ id: "incident_1" }),
      incident({ id: "incident_2", branchId: "branch_2", restroomId: "restroom_2" }),
    ]);
    mocks.listActivityLogsByOrganization.mockResolvedValue([
      activityLog({ id: "visible_shift" }),
      activityLog({
        id: "visible_no_shift",
        action: "worker_note",
        actionType: "worker_note",
        incidentId: null,
        shiftId: undefined,
        metadata: { shiftResolution: "none" },
      }),
      activityLog({
        id: "hidden_formula",
        actorUserId: "worker_2",
        actorFullName: "=רות לוי",
        incidentId: "incident_2",
        targetId: "incident_2",
        branchId: "branch_2",
        restroomId: "restroom_2",
        shiftId: "shift_2",
      }),
    ]);
  });

  it("exports only rows matching employee and shift filters", async () => {
    const csv = await exportCsv("http://localhost/api/admin/reports/team/export?userId=worker_1&shiftId=shift_1");

    expect(csv).toContain("דני כהן");
    expect(csv).toContain("בוקר");
    expect(csv).not.toContain("=רות לוי");
    expect(csv).not.toContain("הערת עובד");
  });

  it("exports no-shift activity separately with shiftResolution metadata", async () => {
    const csv = await exportCsv("http://localhost/api/admin/reports/team/export?userId=worker_1&action=worker_note");

    expect(csv).toContain("ללא שיוך משמרת");
    expect(csv).toContain("none");
  });

  it("keeps area manager CSV scoped to visible restrooms", async () => {
    mocks.requireUser.mockResolvedValue(manager);

    const csv = await exportCsv("http://localhost/api/admin/reports/team/export?restroomId=restroom_2");

    expect(csv).not.toContain("=רות לוי");
    expect(csv).not.toContain("סניף מוסתר");
    expect(csv.trim().split("\n")).toHaveLength(1);
  });

  it("escapes spreadsheet formulas in exported values", async () => {
    const csv = await exportCsv("http://localhost/api/admin/reports/team/export?userId=worker_2");

    expect(csv).toContain("'=רות לוי");
  });
});
