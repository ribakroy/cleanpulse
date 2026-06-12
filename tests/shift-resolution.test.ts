import { describe, expect, it } from "vitest";
import { resolveShiftForAction } from "@/lib/shifts/resolve-shift";
import type { SafeUserRecord, ShiftRecord } from "@/lib/data/types";

const user: Pick<SafeUserRecord, "id" | "defaultShiftId"> = {
  id: "user_1",
  defaultShiftId: "shift_default",
};

function shift(overrides: Partial<ShiftRecord>): ShiftRecord {
  return {
    id: "shift_1",
    organizationId: "org_1",
    branchId: "branch_1",
    restroomIds: ["restroom_1"],
    assignedUserIds: ["user_1"],
    name: "בוקר",
    startsAt: "08:00",
    endsAt: "14:00",
    daysOfWeek: [5],
    isActive: true,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("resolveShiftForAction", () => {
  it("uses an active assigned shift matching worker, branch, restroom, day and time", () => {
    expect(resolveShiftForAction({
      user,
      branchId: "branch_1",
      restroomId: "restroom_1",
      timestamp: "2026-06-12T08:30:00.000Z",
      shifts: [shift({})],
    })).toEqual({
      shiftId: "shift_1",
      shiftResolution: "matched",
    });
  });

  it("falls back to defaultShiftId only when that shift also matches the action context", () => {
    expect(resolveShiftForAction({
      user,
      branchId: "branch_1",
      restroomId: "restroom_1",
      timestamp: "2026-06-12T08:30:00.000Z",
      shifts: [
        shift({ id: "shift_1", assignedUserIds: ["other_user"] }),
        shift({ id: "shift_default", assignedUserIds: [], startsAt: "08:00", endsAt: "18:00" }),
      ],
    })).toEqual({
      shiftId: "shift_default",
      shiftResolution: "default",
    });
  });

  it("does not invent a shift outside matching branch or restroom", () => {
    expect(resolveShiftForAction({
      user,
      branchId: "branch_1",
      restroomId: "restroom_1",
      timestamp: "2026-06-12T08:30:00.000Z",
      shifts: [shift({ branchId: "branch_2", restroomIds: ["restroom_2"] })],
    })).toEqual({
      shiftResolution: "outside_shift",
    });
  });

  it("marks unassigned actions as none when no shift relationship exists", () => {
    expect(resolveShiftForAction({
      user: { id: "user_1" },
      branchId: "branch_1",
      restroomId: "restroom_1",
      timestamp: "2026-06-12T08:30:00.000Z",
      shifts: [shift({ assignedUserIds: ["other_user"] })],
    })).toEqual({
      shiftResolution: "none",
    });
  });
});
