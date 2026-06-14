import { describe, expect, it } from "vitest";
import {
  formatTeamReportDateForInput,
  getDetectedShiftStatusLabel,
  getShiftLinkLabel,
  isLogInTeamReportDateRange,
  matchesShiftLinkFilter,
  normalizeTeamReportDate,
  teamReportActionLabels,
  teamReportRoleFilterOptions,
  teamReportShiftLinkOptions,
} from "@/lib/reports/team-filters";

describe("team report filters", () => {
  it("normalizes team report date filters without changing invalid input handling", () => {
    expect(normalizeTeamReportDate("2026-06-12")).toBe("2026-06-12");
    expect(normalizeTeamReportDate(" 12/06/2026 ")).toBe("2026-06-12");
    expect(normalizeTeamReportDate("12.06.2026")).toBe("2026-06-12");
    expect(normalizeTeamReportDate("not-a-date")).toBe("");

    expect(formatTeamReportDateForInput("2026-06-12")).toBe("12/06/2026");
    expect(formatTeamReportDateForInput("not-a-date")).toBe("not-a-date");
  });

  it("keeps activity log date range checks inclusive", () => {
    expect(isLogInTeamReportDateRange("2026-06-12T12:00:00.000Z", "2026-06-12", "2026-06-12")).toBe(true);
    expect(isLogInTeamReportDateRange("2026-06-11T12:00:00.000Z", "2026-06-12", "")).toBe(false);
    expect(isLogInTeamReportDateRange("2026-06-13T12:00:00.000Z", "", "2026-06-12")).toBe(false);
  });

  it("keeps team report role, action, and shift labels stable", () => {
    expect(teamReportRoleFilterOptions).toEqual([
      "owner",
      "admin",
      "area_manager",
      "operations_worker",
      "manager",
      "cleaner",
    ]);
    expect(teamReportShiftLinkOptions.has("needs_completion")).toBe(true);
    expect(teamReportActionLabels.worker_note).toBe("הערת עובד");
    expect(getDetectedShiftStatusLabel("needs_completion")).toBe("משמרת שזוהתה - דורשת השלמה");
    expect(getDetectedShiftStatusLabel("draft")).toBe("משמרת שזוהתה");
  });

  it("matches manual, detected, needs-completion, and no-shift filters", () => {
    expect(matchesShiftLinkFilter({ shiftId: "shift_1" }, "confirmed")).toBe(true);
    expect(matchesShiftLinkFilter({ detectedShiftId: "detected_1", detectedStatus: "confirmed" }, "confirmed")).toBe(true);
    expect(matchesShiftLinkFilter({ detectedShiftId: "detected_1", detectedStatus: "needs_completion" }, "needs_completion")).toBe(true);
    expect(matchesShiftLinkFilter({ detectedShiftId: "detected_1", detectedStatus: "draft" }, "needs_completion")).toBe(false);
    expect(matchesShiftLinkFilter({}, "no_shift")).toBe(true);

    expect(getShiftLinkLabel({ shiftId: "shift_1" })).toBe("משמרת ידנית");
    expect(getShiftLinkLabel({ detectedShiftId: "detected_1", detectedStatus: "confirmed" })).toBe("משמרת שזוהתה ואושרה");
    expect(getShiftLinkLabel({})).toBe("ללא שיוך משמרת");
  });
});
