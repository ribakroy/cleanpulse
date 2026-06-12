import { getDataAdapter } from "@/lib/data/get-data-adapter";
import { createPrefixedId, ensureOrganizationOwnership, nowIso } from "@/lib/data/repositories/_shared";
import type { DetectedShiftRecord } from "@/lib/data/types";

export async function listDetectedShiftsByOrganization(organizationId: string) {
  return getDataAdapter().query("detected_shifts", {
    organizationId,
    sortBy: "updatedAt",
    sortDirection: "desc",
  });
}

export async function getDetectedShiftById(organizationId: string, id: string) {
  return ensureOrganizationOwnership("detected_shifts", organizationId, await getDataAdapter().get("detected_shifts", id));
}

export async function createDetectedShift(input: Omit<DetectedShiftRecord, "id" | "createdAt" | "updatedAt">) {
  const timestamp = nowIso();

  return getDataAdapter().create("detected_shifts", {
    ...input,
    id: createPrefixedId("detected_shift"),
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export async function updateDetectedShift(
  organizationId: string,
  id: string,
  patch: Partial<Omit<DetectedShiftRecord, "id" | "organizationId" | "createdAt" | "updatedAt">>,
) {
  await ensureOrganizationOwnership("detected_shifts", organizationId, await getDataAdapter().get("detected_shifts", id));

  return getDataAdapter().update("detected_shifts", id, {
    ...patch,
    updatedAt: nowIso(),
  });
}

export async function attachActivityLogToDetectedShift(organizationId: string, id: string, activityLogId: string) {
  const detectedShift = await getDetectedShiftById(organizationId, id);
  if (!detectedShift) {
    return null;
  }

  const createdFromActivityLogIds = Array.from(new Set([
    ...(detectedShift.createdFromActivityLogIds ?? []),
    activityLogId,
  ]));

  return updateDetectedShift(organizationId, id, { createdFromActivityLogIds });
}

export async function markDetectedShiftCompletionRequested(
  organizationId: string,
  id: string,
  userIds: string[],
) {
  return updateDetectedShift(organizationId, id, {
    completionRequestedAt: nowIso(),
    completionRequestedToUserIds: Array.from(new Set(userIds)),
  });
}

export async function confirmDetectedShift(
  organizationId: string,
  id: string,
  patch: {
    shiftName: string;
    branchId: string;
    restroomIds: string[];
    assignedUserIds: string[];
    managerUserId?: string | undefined;
    confirmedStartAt: string;
    confirmedEndAt: string;
    daysOfWeek: number[];
    confirmedByUserId: string;
  },
) {
  return updateDetectedShift(organizationId, id, {
    ...patch,
    status: "confirmed",
    missingFields: [],
    confidence: "high",
    confirmedAt: nowIso(),
  });
}

export async function dismissDetectedShift(
  organizationId: string,
  id: string,
  dismissedByUserId: string,
) {
  return updateDetectedShift(organizationId, id, {
    status: "dismissed",
    dismissedByUserId,
    dismissedAt: nowIso(),
  });
}
