import type { SafeUserRecord, ShiftRecord } from "@/lib/data/types";

export type ShiftResolution = "matched" | "default" | "none" | "outside_shift";

export type ResolvedShiftForAction = {
  shiftId?: string | undefined;
  shiftResolution: ShiftResolution;
};

type ResolveShiftForActionInput = {
  user: Pick<SafeUserRecord, "id" | "defaultShiftId">;
  branchId: string;
  restroomId: string;
  timestamp: string;
  shifts: ShiftRecord[];
};

const BUSINESS_TIME_ZONE = "Asia/Jerusalem";
const weekdayMap: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function parseClock(value: string) {
  const parts = value.split(":").map(Number);
  const hour = parts[0];
  const minute = parts[1];
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null;
  }

  return hour! * 60 + minute!;
}

function getLocalClock(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const timeParts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: "short",
  }).format(date);
  const hour = Number(timeParts.find((part) => part.type === "hour")?.value);
  const minute = Number(timeParts.find((part) => part.type === "minute")?.value);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null;
  }

  return {
    minuteOfDay: hour * 60 + minute,
    dayOfWeek: weekdayMap[weekday] ?? date.getDay(),
  };
}

function previousDay(dayOfWeek: number) {
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}

function matchesTimeWindow(shift: ShiftRecord, timestamp: string) {
  const clock = getLocalClock(timestamp);
  const start = parseClock(shift.startsAt);
  const end = parseClock(shift.endsAt);

  if (!clock || start === null || end === null) {
    return false;
  }

  const isOvernight = start > end;
  const inTimeWindow = isOvernight
    ? clock.minuteOfDay >= start || clock.minuteOfDay <= end
    : clock.minuteOfDay >= start && clock.minuteOfDay <= end;

  if (!inTimeWindow) {
    return false;
  }

  const days = shift.daysOfWeek;
  if (!days || days.length === 0) {
    return true;
  }

  const effectiveDay = isOvernight && clock.minuteOfDay <= end
    ? previousDay(clock.dayOfWeek)
    : clock.dayOfWeek;

  return days.includes(effectiveDay);
}

function matchesLocation(shift: ShiftRecord, branchId: string, restroomId: string) {
  if (shift.branchId && shift.branchId !== branchId) {
    return false;
  }

  if (shift.restroomIds?.length && !shift.restroomIds.includes(restroomId)) {
    return false;
  }

  return true;
}

function matchesShift(shift: ShiftRecord, input: ResolveShiftForActionInput) {
  return (
    shift.isActive &&
    matchesLocation(shift, input.branchId, input.restroomId) &&
    matchesTimeWindow(shift, input.timestamp)
  );
}

export function resolveShiftForAction(input: ResolveShiftForActionInput): ResolvedShiftForAction {
  const activeShifts = input.shifts.filter((shift) => shift.isActive);
  const assignedShifts = activeShifts.filter((shift) => shift.assignedUserIds?.includes(input.user.id));
  const assignedMatch = assignedShifts.find((shift) => matchesShift(shift, input));

  if (assignedMatch) {
    return {
      shiftId: assignedMatch.id,
      shiftResolution: "matched",
    };
  }

  const defaultShift = input.user.defaultShiftId
    ? activeShifts.find((shift) => shift.id === input.user.defaultShiftId)
    : undefined;

  if (defaultShift && matchesShift(defaultShift, input)) {
    return {
      shiftId: defaultShift.id,
      shiftResolution: "default",
    };
  }

  if (assignedShifts.length > 0 || defaultShift) {
    return { shiftResolution: "outside_shift" };
  }

  return { shiftResolution: "none" };
}
