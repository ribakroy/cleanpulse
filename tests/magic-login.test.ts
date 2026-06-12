/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";

const store: Record<string, any[]> = {};

function resetStore() {
  for (const key of Object.keys(store)) {
    delete store[key];
  }
  store.magic_login_tokens = [];
  store.users = [];
  store.incidents = [];
  store.activity_logs = [];
  store.system_settings = [];
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
        return record[key] === value;
      });
    }).slice(0, filter.limit ?? undefined);
  }),
  get: vi.fn(async (collection: string, id: string) => {
    return records(collection).find((record) => record.id === id) ?? null;
  }),
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

import {
  createMagicLoginToken,
  hashMagicLoginToken,
} from "@/lib/data/repositories/magic-login-tokens";
import {
  canUseMagicLoginTarget,
  consumeMagicLoginToken,
} from "@/lib/auth/magic-login";

describe("magic login tokens", () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  it("stores only a hash and never persists the raw token", async () => {
    const { rawToken, record } = await createMagicLoginToken({
      organizationId: "org_1",
      userId: "user_1",
      targetPath: "/work",
      purpose: "worker_task",
    });

    expect(record.tokenHash).toBe(hashMagicLoginToken(rawToken));
    expect(record.tokenHash).not.toBe(rawToken);
    expect(JSON.stringify(record)).not.toContain(rawToken);
  });

  it("rejects expired, used and revoked tokens", async () => {
    const now = new Date().toISOString();
    const cases = [
      { id: "expired", expiresAt: "2020-01-01T00:00:00.000Z" },
      { id: "used", expiresAt: "2099-01-01T00:00:00.000Z", usedAt: now },
      { id: "revoked", expiresAt: "2099-01-01T00:00:00.000Z", revokedAt: now },
    ];

    for (const item of cases) {
      const rawToken = `raw-${item.id}`;
      records("magic_login_tokens").push({
        organizationId: "org_1",
        userId: "user_1",
        tokenHash: hashMagicLoginToken(rawToken),
        targetPath: "/work",
        purpose: "worker_task",
        createdAt: now,
        updatedAt: now,
        ...item,
      });

      const result = await consumeMagicLoginToken(rawToken);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe(item.id);
      }
    }
  });

  it("marks a successful token as used and writes activity log", async () => {
    records("users").push({
      id: "user_worker",
      organizationId: "org_1",
      email: "worker@example.com",
      fullName: "Worker One",
      role: "operations_worker",
      isActive: true,
      assignedRestroomIds: ["restroom_1"],
      allowedBranchIds: [],
      allowedRestroomIds: [],
    });

    const { rawToken, record } = await createMagicLoginToken({
      organizationId: "org_1",
      userId: "user_worker",
      targetPath: "/work",
      purpose: "worker_task",
    });

    const result = await consumeMagicLoginToken(rawToken);

    expect(result).toMatchObject({
      ok: true,
      redirectPath: "/work",
      authorizedTarget: true,
    });
    expect(record.usedAt).toBeTruthy();
    expect(records("activity_logs")[0]).toMatchObject({
      actorUserId: "user_worker",
      actorFullName: "Worker One",
      actionType: "magic_login_used",
    });
  });

  it("does not let worker magic links open admin routes", async () => {
    const worker = {
      id: "worker",
      organizationId: "org_1",
      role: "operations_worker",
      isActive: true,
      assignedRestroomIds: ["restroom_1"],
      allowedBranchIds: [],
      allowedRestroomIds: [],
    } as any;

    await expect(canUseMagicLoginTarget(worker, "/admin/users")).resolves.toBe(false);
    await expect(canUseMagicLoginTarget(worker, "/work")).resolves.toBe(true);
  });

  it("enforces area manager restroom scope for incident targets", async () => {
    const manager = {
      id: "manager",
      organizationId: "org_1",
      role: "area_manager",
      isActive: true,
      allowedBranchIds: [],
      allowedRestroomIds: ["restroom_allowed"],
      assignedRestroomIds: [],
    } as any;
    records("incidents").push(
      {
        id: "incident_allowed",
        organizationId: "org_1",
        branchId: "branch_1",
        restroomId: "restroom_allowed",
      },
      {
        id: "incident_blocked",
        organizationId: "org_1",
        branchId: "branch_1",
        restroomId: "restroom_blocked",
      },
    );

    await expect(canUseMagicLoginTarget(manager, "/admin/incidents/incident_allowed")).resolves.toBe(true);
    await expect(canUseMagicLoginTarget(manager, "/admin/incidents/incident_blocked")).resolves.toBe(false);
  });
});
