"use server";

import { createActivityLog, listActivityLogsByOrganization } from "@/lib/data/repositories/activity-logs";
import { attachActivityLogToDetectedShift } from "@/lib/data/repositories/detected-shifts";
import { getRestroomById } from "@/lib/data/repositories/restrooms";
import { listShiftsByOrganization } from "@/lib/data/repositories/shifts";
import { canViewRestroom, isOperationsWorker } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { detectOrUpdateShiftFromActivity } from "@/lib/shifts/detect-shift";
import { resolveShiftForAction } from "@/lib/shifts/resolve-shift";

const WORK_PRESENCE_THROTTLE_MINUTES = 10;

export async function logWorkPresenceAction(restroomId: string) {
  const user = await requireUser();
  if (!isOperationsWorker(user)) {
    throw new Error("אין הרשאה לאזור העבודה");
  }

  const restroom = await getRestroomById(user.organizationId, restroomId);
  if (!restroom || !canViewRestroom(user, restroom)) {
    throw new Error("אזור העבודה אינו משויך למשתמש");
  }

  const activityLogs = await listActivityLogsByOrganization(user.organizationId, { limit: 80 });
  const now = Date.now();
  const hasRecentPresence = activityLogs.some((log) => {
    if (log.actorUserId !== user.id || log.action !== "work_portal_viewed" || log.restroomId !== restroom.id) {
      return false;
    }

    return now - new Date(log.createdAt).getTime() <= WORK_PRESENCE_THROTTLE_MINUTES * 60 * 1000;
  });

  if (hasRecentPresence) {
    return { ok: true, skipped: true };
  }

  const timestamp = new Date(now).toISOString();
  const shifts = await listShiftsByOrganization(user.organizationId);
  const shift = resolveShiftForAction({
    user,
    branchId: restroom.branchId,
    restroomId: restroom.id,
    timestamp,
    shifts,
  });
  const detectedShift = shift.shiftId
    ? null
    : await detectOrUpdateShiftFromActivity({
      user,
      actionType: "work_portal_viewed",
      branchId: restroom.branchId,
      restroomId: restroom.id,
      timestamp,
    });
  const log = await createActivityLog({
    organizationId: user.organizationId,
    actorUserId: user.id,
    actorFullName: user.fullName,
    actorRole: user.role,
    incidentId: null,
    action: "work_portal_viewed",
    actionType: "work_portal_viewed",
    targetType: "work",
    targetId: restroom.id,
    branchId: restroom.branchId,
    restroomId: restroom.id,
    shiftId: shift.shiftId,
    detectedShiftId: detectedShift?.id,
    metadata: {
      actorName: user.fullName,
      actorRole: user.role,
      shiftResolution: shift.shiftResolution,
      shiftLinkType: shift.shiftId ? "manual" : detectedShift ? "detected" : "none",
      detectedShiftStatus: detectedShift?.status,
    },
  });

  if (detectedShift) {
    await attachActivityLogToDetectedShift(user.organizationId, detectedShift.id, log.id);
  }

  return { ok: true, skipped: false };
}
