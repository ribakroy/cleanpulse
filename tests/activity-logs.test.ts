import { beforeEach, describe, expect, it, vi } from "vitest";
import { createActivityLog } from "@/lib/data/repositories/activity-logs";

const mocks = vi.hoisted(() => ({
  appendLog: vi.fn(),
}));

vi.mock("@/lib/data/get-data-adapter", () => ({
  getDataAdapter: vi.fn(() => ({
    appendLog: mocks.appendLog,
  })),
}));

describe("activity logs", () => {
  beforeEach(() => {
    mocks.appendLog.mockReset();
    mocks.appendLog.mockImplementation((_collection, record) => Promise.resolve(record));
  });

  it("writes actor identity fields for employee actions", async () => {
    const log = await createActivityLog({
      organizationId: "org_1",
      actorUserId: "user_1",
      actorFullName: "דני כהן",
      actorRole: "operations_worker",
      incidentId: "incident_1",
      action: "status_resolved",
      targetType: "incident",
      targetId: "incident_1",
      branchId: "branch_1",
      restroomId: "restroom_1",
    });

    expect(mocks.appendLog).toHaveBeenCalledWith(
      "activity_logs",
      expect.objectContaining({
        actorUserId: "user_1",
        actorFullName: "דני כהן",
        actorRole: "operations_worker",
        action: "status_resolved",
        actionType: "status_resolved",
        targetType: "incident",
        targetId: "incident_1",
        branchId: "branch_1",
        restroomId: "restroom_1",
      }),
    );
    expect(log.actorFullName).toBe("דני כהן");
  });
});
