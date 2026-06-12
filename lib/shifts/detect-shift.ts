import { createActivityLog } from "@/lib/data/repositories/activity-logs";
import {
  createDetectedShift,
  listDetectedShiftsByOrganization,
  updateDetectedShift,
} from "@/lib/data/repositories/detected-shifts";
import { sendDetectedShiftCompletionRequest } from "@/lib/email/send-detected-shift-completion-request";
import type { DetectedShiftRecord, SafeUserRecord } from "@/lib/data/types";

const DETECTION_WINDOW_HOURS = 8;

const defaultMissingFields = [
  "branchId",
  "restroomIds",
  "assignedUserIds",
  "managerUserId",
  "confirmedStartAt",
  "confirmedEndAt",
  "shiftName",
  "daysOfWeek",
];

export type DetectOrUpdateShiftFromActivityInput = {
  user: Pick<SafeUserRecord, "id" | "organizationId" | "fullName" | "role">;
  actionType: string;
  branchId?: string | undefined;
  restroomId?: string | undefined;
  timestamp?: string | undefined;
  activityLogId?: string | undefined;
  requestCompletionEmail?: boolean | undefined;
};

function isManagerRole(role: string) {
  return role === "area_manager" || role === "manager";
}

function unique(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function getMissingFields(input: {
  branchId?: string | undefined;
  restroomIds?: string[] | undefined;
  assignedUserIds?: string[] | undefined;
  managerUserId?: string | undefined;
  confirmedStartAt?: string | undefined;
  confirmedEndAt?: string | undefined;
  shiftName?: string | undefined;
  daysOfWeek?: number[] | undefined;
}) {
  return defaultMissingFields.filter((field) => {
    if (field === "branchId") return !input.branchId;
    if (field === "restroomIds") return !input.restroomIds?.length;
    if (field === "assignedUserIds") return !input.assignedUserIds?.length;
    if (field === "managerUserId") return !input.managerUserId;
    if (field === "confirmedStartAt") return !input.confirmedStartAt;
    if (field === "confirmedEndAt") return !input.confirmedEndAt;
    if (field === "shiftName") return !input.shiftName;
    if (field === "daysOfWeek") return !input.daysOfWeek?.length;
    return false;
  });
}

function getConfidence(input: {
  branchId?: string | undefined;
  restroomIds?: string[] | undefined;
  assignedUserIds?: string[] | undefined;
  activityCount: number;
}) {
  if (input.branchId && input.restroomIds?.length && input.assignedUserIds?.length && input.activityCount >= 2) {
    return "high";
  }

  if ((input.branchId || input.restroomIds?.length) && input.assignedUserIds?.length) {
    return "medium";
  }

  return "low";
}

function getStatus(missingFields: string[]) {
  return missingFields.length > 0 ? "needs_completion" : "draft";
}

function isWithinWindow(detectedShift: DetectedShiftRecord, timestamp: string) {
  const actionTime = new Date(timestamp).getTime();
  const anchor = detectedShift.inferredEndAt ?? detectedShift.inferredStartAt ?? detectedShift.createdAt;
  const anchorTime = new Date(anchor).getTime();

  if (!Number.isFinite(actionTime) || !Number.isFinite(anchorTime)) {
    return false;
  }

  return Math.abs(actionTime - anchorTime) <= DETECTION_WINDOW_HOURS * 60 * 60 * 1000;
}

function matchesDetectedShift(
  detectedShift: DetectedShiftRecord,
  input: DetectOrUpdateShiftFromActivityInput,
  timestamp: string,
) {
  if (detectedShift.status !== "draft" && detectedShift.status !== "needs_completion") {
    return false;
  }

  if (!isWithinWindow(detectedShift, timestamp)) {
    return false;
  }

  if (input.branchId && detectedShift.branchId && input.branchId !== detectedShift.branchId) {
    return false;
  }

  if (input.restroomId && detectedShift.restroomIds?.length && !detectedShift.restroomIds.includes(input.restroomId)) {
    return input.branchId ? detectedShift.branchId === input.branchId : false;
  }

  return Boolean(
    detectedShift.assignedUserIds?.includes(input.user.id) ||
    (input.branchId && (!detectedShift.branchId || detectedShift.branchId === input.branchId)) ||
    (input.restroomId && (!detectedShift.restroomIds?.length || detectedShift.restroomIds.includes(input.restroomId))),
  );
}

function getInferredStartAt(existing: DetectedShiftRecord, timestamp: string) {
  if (!existing.inferredStartAt) return timestamp;
  return new Date(timestamp).getTime() < new Date(existing.inferredStartAt).getTime() ? timestamp : existing.inferredStartAt;
}

function getInferredEndAt(existing: DetectedShiftRecord, timestamp: string) {
  if (!existing.inferredEndAt) return timestamp;
  return new Date(timestamp).getTime() > new Date(existing.inferredEndAt).getTime() ? timestamp : existing.inferredEndAt;
}

async function logDetectedShiftEvent(input: {
  user: DetectOrUpdateShiftFromActivityInput["user"];
  action: "detected_shift_created" | "detected_shift_updated";
  detectedShift: DetectedShiftRecord;
}) {
  await createActivityLog({
    organizationId: input.detectedShift.organizationId,
    actorUserId: input.user.id,
    actorFullName: input.user.fullName,
    actorRole: input.user.role,
    incidentId: null,
    action: input.action,
    actionType: input.action,
    targetType: "detected_shift",
    targetId: input.detectedShift.id,
    branchId: input.detectedShift.branchId,
    detectedShiftId: input.detectedShift.id,
    metadata: {
      source: "system",
      triggeringActorUserId: input.user.id,
      missingFields: input.detectedShift.missingFields,
      confidence: input.detectedShift.confidence,
    },
  });
}

export async function detectOrUpdateShiftFromActivity(input: DetectOrUpdateShiftFromActivityInput) {
  const timestamp = input.timestamp ?? new Date().toISOString();
  const managerUserId = isManagerRole(input.user.role) ? input.user.id : undefined;
  const existingDetectedShifts = await listDetectedShiftsByOrganization(input.user.organizationId);
  const current = existingDetectedShifts.find((detectedShift) => matchesDetectedShift(detectedShift, input, timestamp));
  const shouldRequestCompletionEmail = input.requestCompletionEmail ?? true;

  if (current) {
    const assignedUserIds = unique([...(current.assignedUserIds ?? []), input.user.id]);
    const restroomIds = unique([...(current.restroomIds ?? []), input.restroomId]);
    const nextManagerUserId = current.managerUserId ?? managerUserId;
    const activityLogIds = unique([...(current.createdFromActivityLogIds ?? []), input.activityLogId]);
    const missingFields = getMissingFields({
      branchId: current.branchId ?? input.branchId,
      restroomIds,
      assignedUserIds,
      managerUserId: nextManagerUserId,
      confirmedStartAt: current.confirmedStartAt,
      confirmedEndAt: current.confirmedEndAt,
      shiftName: current.shiftName,
      daysOfWeek: current.daysOfWeek,
    });
    const updated = await updateDetectedShift(input.user.organizationId, current.id, {
      branchId: current.branchId ?? input.branchId,
      restroomIds,
      assignedUserIds,
      managerUserId: nextManagerUserId,
      inferredStartAt: getInferredStartAt(current, timestamp),
      inferredEndAt: getInferredEndAt(current, timestamp),
      createdFromActivityLogIds: activityLogIds,
      missingFields,
      status: getStatus(missingFields),
      confidence: getConfidence({
        branchId: current.branchId ?? input.branchId,
        restroomIds,
        assignedUserIds,
        activityCount: activityLogIds.length,
      }),
    });

    await logDetectedShiftEvent({ user: input.user, action: "detected_shift_updated", detectedShift: updated });
    if (shouldRequestCompletionEmail) {
      await sendDetectedShiftCompletionRequest(updated);
    }

    return updated;
  }

  const assignedUserIds = [input.user.id];
  const restroomIds = input.restroomId ? [input.restroomId] : [];
  const activityLogIds = input.activityLogId ? [input.activityLogId] : [];
  const missingFields = getMissingFields({
    branchId: input.branchId,
    restroomIds,
    assignedUserIds,
    managerUserId,
  });
  const created = await createDetectedShift({
    organizationId: input.user.organizationId,
    branchId: input.branchId,
    restroomIds,
    assignedUserIds,
    managerUserId,
    inferredStartAt: timestamp,
    inferredEndAt: timestamp,
    source: "detected",
    status: getStatus(missingFields),
    missingFields,
    confidence: getConfidence({
      branchId: input.branchId,
      restroomIds,
      assignedUserIds,
      activityCount: activityLogIds.length,
    }),
    createdFromActivityLogIds: activityLogIds,
  });

  await logDetectedShiftEvent({ user: input.user, action: "detected_shift_created", detectedShift: created });
  if (shouldRequestCompletionEmail) {
    await sendDetectedShiftCompletionRequest(created);
  }

  return created;
}
