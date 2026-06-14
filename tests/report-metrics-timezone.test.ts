import { describe, expect, it } from "vitest";
import {
  filterIncidents,
  getDateKeyInReportsTimeZone,
  getHourInReportsTimeZone,
  groupIncidentsByDay,
  groupIncidentsByHour,
  isSameDay,
} from "@/lib/reports/metrics";
import type { IncidentRecord } from "@/lib/data/types";

function incident(id: string, openedAt: string): IncidentRecord {
  return {
    id,
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
    openedAt,
    acknowledgedAt: null,
    inProgressAt: null,
    resolvedAt: null,
    dismissedAt: null,
    assignedToUserId: null,
    resolvedByUserId: null,
    resolutionNote: null,
    source: "qr",
    createdAt: openedAt,
    updatedAt: openedAt,
  };
}

describe("reports timezone metrics", () => {
  it("groups hourly report charts by Asia/Jerusalem instead of UTC", () => {
    const rows = groupIncidentsByHour([
      incident("one", "2026-06-13T02:00:00.000Z"),
      incident("two", "2026-06-13T18:15:00.000Z"),
    ]);

    expect(getHourInReportsTimeZone("2026-06-13T02:00:00.000Z")).toBe("05");
    expect(rows.find((row) => row.label === "05:00")?.count).toBe(1);
    expect(rows.find((row) => row.label === "21:00")?.count).toBe(1);
  });

  it("uses Jerusalem day boundaries for same-day checks and date filters", () => {
    const lateUtc = incident("late", "2026-06-12T22:30:00.000Z");
    const earlyUtc = incident("early", "2026-06-13T01:30:00.000Z");

    expect(getDateKeyInReportsTimeZone(lateUtc.openedAt)).toBe("2026-06-13");
    expect(isSameDay(lateUtc.openedAt, new Date("2026-06-13T08:00:00.000Z"))).toBe(true);
    expect(filterIncidents([lateUtc, earlyUtc], { startDate: "2026-06-13", endDate: "2026-06-13" }).map((item) => item.id)).toEqual([
      "late",
      "early",
    ]);
    expect(groupIncidentsByDay([lateUtc])[0]).toEqual({ label: "2026-06-13", count: 1 });
  });
});
