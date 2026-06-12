import { describe, expect, it } from "vitest";
import {
  canManageUsers,
  canUpdateIncident,
  canViewReports,
  filterIncidentsForUser,
  filterRestroomsForUser,
  getDefaultRouteForRole,
  isAreaManager,
  isOperationsWorker,
} from "@/lib/auth/permissions";
import type { IncidentRecord, RestroomRecord, SafeUserRecord } from "@/lib/data/types";

const baseUser = {
  id: "user_1",
  organizationId: "org_1",
  email: "user@example.com",
  fullName: "Test User",
  isActive: true,
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
} satisfies Omit<SafeUserRecord, "role">;

function user(overrides: Partial<SafeUserRecord>): SafeUserRecord {
  return {
    ...baseUser,
    role: "owner",
    ...overrides,
  };
}

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

function restroom(overrides: Partial<RestroomRecord>): RestroomRecord {
  return {
    id: "restroom_1",
    organizationId: "org_1",
    branchId: "branch_1",
    name: "שירותי קומה 1",
    floor: "1",
    areaDescription: "",
    isActive: true,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("permissions", () => {
  it("keeps owner and admin as business managers", () => {
    expect(canViewReports(user({ role: "owner" }))).toBe(true);
    expect(canViewReports(user({ role: "admin" }))).toBe(true);
    expect(canManageUsers(user({ role: "owner" }))).toBe(true);
    expect(canManageUsers(user({ role: "admin" }))).toBe(true);
  });

  it("supports area_manager and legacy manager aliases", () => {
    expect(isAreaManager(user({ role: "area_manager" }))).toBe(true);
    expect(isAreaManager(user({ role: "manager" }))).toBe(true);
    expect(canViewReports(user({ role: "area_manager", allowedBranchIds: ["branch_1"] }))).toBe(true);
  });

  it("supports operations_worker and legacy cleaner aliases", () => {
    expect(isOperationsWorker(user({ role: "operations_worker" }))).toBe(true);
    expect(isOperationsWorker(user({ role: "cleaner" }))).toBe(true);
    expect(canViewReports(user({ role: "cleaner" }))).toBe(false);
  });

  it("filters area_manager records to assigned scope", () => {
    const manager = user({ role: "area_manager", allowedRestroomIds: ["restroom_1"] });
    const visible = incident({ id: "visible", restroomId: "restroom_1" });
    const hidden = incident({ id: "hidden", restroomId: "restroom_2", branchId: "branch_2" });

    expect(filterIncidentsForUser(manager, [visible, hidden]).map((item) => item.id)).toEqual(["visible"]);
    expect(canUpdateIncident(manager, visible)).toBe(true);
    expect(canUpdateIncident(manager, hidden)).toBe(false);
  });

  it("keeps legacy unscoped manager backward compatible with full organization access", () => {
    const legacyManager = user({ role: "manager" });

    expect(filterIncidentsForUser(legacyManager, [
      incident({ id: "one", restroomId: "restroom_1" }),
      incident({ id: "two", restroomId: "restroom_2" }),
    ])).toHaveLength(2);
  });

  it("keeps unscoped cleaner login compatible but shows no work scope", () => {
    const cleaner = user({ role: "cleaner" });

    expect(filterRestroomsForUser(cleaner, [restroom({ id: "restroom_1" })])).toHaveLength(0);
  });

  it("routes roles to the correct post-login area", () => {
    expect(getDefaultRouteForRole("super_admin")).toBe("/super/dashboard");
    expect(getDefaultRouteForRole("owner")).toBe("/admin/dashboard");
    expect(getDefaultRouteForRole("manager")).toBe("/admin/dashboard");
    expect(getDefaultRouteForRole("operations_worker")).toBe("/work");
    expect(getDefaultRouteForRole("cleaner")).toBe("/work");
  });
});
