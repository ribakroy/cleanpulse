/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";

const store: Record<string, any[]> = {};

function resetStore() {
  for (const key of Object.keys(store)) delete store[key];
  store.branches = [];
  store.restrooms = [];
  store.screens = [];
  store.issue_types = [];
  store.notification_recipients = [];
  store.notification_logs = [];
  store.users = [];
  store.magic_login_tokens = [];
  store.system_settings = [];
}

function records(collection: string) {
  store[collection] ??= [];
  return store[collection];
}

const adapter = {
  get: vi.fn(async (collection: string, id: string) => records(collection).find((record) => record.id === id) ?? null),
  query: vi.fn(async (collection: string, filter: Record<string, any> = {}) => records(collection).filter((record) => {
    return Object.entries(filter).every(([key, value]) => {
      if (["includeInactive", "limit", "sortBy", "sortDirection"].includes(key)) return true;
      return record[key] === value;
    });
  })),
  create: vi.fn(async (collection: string, record: any) => {
    records(collection).push(record);
    return record;
  }),
  update: vi.fn(async (collection: string, id: string, patch: any) => {
    const record = records(collection).find((candidate) => candidate.id === id);
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

import { sendIncidentAlert } from "@/lib/email/send-incident-alert";

describe("incident alert magic links", () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("generates a hashed magic link for the matching recipient user", async () => {
    records("system_settings").push({
      id: "email_domain_settings",
      appUrl: "https://cleanpulse.example",
      emailProvider: "mock",
      emailMode: "mock",
      fromName: "CleanPulse",
      fromEmail: "no-reply@cleanpulse.local",
      allowedTestRecipients: [],
      domainStatus: "not_configured",
      updatedByUserId: "system",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    records("branches").push({ id: "branch_1", organizationId: "org_1", name: "רוטשילד" });
    records("restrooms").push({ id: "restroom_1", organizationId: "org_1", branchId: "branch_1", name: "קומה 1" });
    records("screens").push({ id: "screen_1", organizationId: "org_1", branchId: "branch_1", restroomId: "restroom_1", name: "QR" });
    records("issue_types").push({ id: "issue_1", key: "not_clean", labelHe: "לא נקי", isActive: true });
    records("notification_recipients").push({
      id: "recipient_1",
      organizationId: "org_1",
      scopeType: "organization",
      scopeId: "org_1",
      name: "מנהל QA",
      email: "manager@example.com",
      enabled: true,
    });
    records("users").push({
      id: "user_manager",
      organizationId: "org_1",
      email: "manager@example.com",
      fullName: "מנהל QA",
      role: "manager",
      isActive: true,
      allowedBranchIds: ["branch_1"],
      allowedRestroomIds: [],
      assignedRestroomIds: [],
    });

    await sendIncidentAlert({
      id: "incident_1",
      organizationId: "org_1",
      branchId: "branch_1",
      restroomId: "restroom_1",
      screenId: "screen_1",
      issueKey: "not_clean",
      rating: 2,
      priority: "medium",
      source: "qr",
      openedAt: "2026-01-01T10:00:00.000Z",
      customerNote: null,
    } as any);

    expect(records("magic_login_tokens")).toHaveLength(1);
    expect(records("magic_login_tokens")[0]).toMatchObject({
      organizationId: "org_1",
      userId: "user_manager",
      targetPath: "/admin/incidents/incident_1",
      purpose: "incident_alert",
    });
    expect(records("magic_login_tokens")[0].tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(records("notification_logs")[0])).not.toContain("token=");
    expect(records("notification_logs")[0]).toMatchObject({
      recipientId: "recipient_1",
      status: "mock_sent",
    });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("token=[REDACTED]"));
  });
});
