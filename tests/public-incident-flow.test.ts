import { beforeEach, describe, expect, it, vi } from "vitest";
import { createVerifiedIncident } from "@/lib/data/repositories/incidents";
import { renderIncidentEmail } from "@/lib/email/render-incident-email";
import type { IncidentRecord } from "@/lib/data/types";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
}));

vi.mock("@/lib/data/get-data-adapter", () => ({
  getDataAdapter: vi.fn(() => ({
    create: mocks.create,
  })),
}));

describe("public incident flow", () => {
  beforeEach(() => {
    mocks.create.mockReset();
    mocks.create.mockImplementation((_collection, record) => Promise.resolve(record));
  });

  it("creates one incident with both rating and issue details", async () => {
    const incident = await createVerifiedIncident({
      organizationId: "org_1",
      branchId: "branch_1",
      restroomId: "restroom_1",
      screenId: "screen_1",
      issueKey: "not_clean",
      rating: 2,
      source: "qr",
      verifiedIssueTypeId: "issue_dirty",
      verifiedIssueSeverity: "high",
    });

    expect(mocks.create).toHaveBeenCalledWith(
      "incidents",
      expect.objectContaining({
        issueKey: "not_clean",
        issueTypeId: "issue_dirty",
        rating: 2,
        priority: "high",
      }),
    );
    expect(incident).toEqual(
      expect.objectContaining({
        issueKey: "not_clean",
        rating: 2,
      }),
    );
  });

  it("renders combined issue and rating details in incident emails", () => {
    const incident: IncidentRecord = {
      id: "incident_1",
      organizationId: "org_1",
      branchId: "branch_1",
      restroomId: "restroom_1",
      screenId: "screen_1",
      issueTypeId: "issue_dirty",
      issueKey: "not_clean",
      rating: 2,
      status: "open",
      priority: "high",
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
    };

    const email = renderIncidentEmail({
      incident,
      branchName: "רוטשילד",
      restroomName: "שירותי לקוחות",
      screenName: "QR קומה 1",
      issueLabel: "רצפה מלוכלכת",
      adminUrl: "https://cleanpulse.local/admin/incidents",
    });

    expect(email.subject).toContain("רצפה מלוכלכת + דירוג 2/5");
    expect(email.html).toContain("דיווח תקלה + ציון כללי");
    expect(email.html).toContain("רצפה מלוכלכת");
    expect(email.html).toContain("2 מתוך 5 כוכבים");
    expect(email.text).toContain("ציון כללי:  2 מתוך 5 כוכבים");
  });
});
