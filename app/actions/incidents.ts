"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { canDismissIncident, canResetRestroom, canUpdateIncident, isAreaManager, isOperationsWorker } from "@/lib/auth/permissions";
import {
  updateIncidentStatus,
  getIncidentById,
  resolveOpenIncidentsForRestroom,
} from "@/lib/data/repositories/incidents";
import { createActivityLog } from "@/lib/data/repositories/activity-logs";
import { listShiftsByOrganization } from "@/lib/data/repositories/shifts";
import { attachActivityLogToDetectedShift } from "@/lib/data/repositories/detected-shifts";
import { detectOrUpdateShiftFromActivity } from "@/lib/shifts/detect-shift";
import { resolveShiftForAction } from "@/lib/shifts/resolve-shift";
import type { IncidentRecord, SafeUserRecord } from "@/lib/data/types";

function revalidateIncidentViews(incidentId: string) {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/incidents");
  revalidatePath(`/admin/incidents/${incidentId}`);
  revalidatePath("/admin/reports");
  revalidatePath("/admin/reports/team");
  revalidatePath("/work");
}

async function logIncidentAction(input: {
  user: SafeUserRecord;
  incident: IncidentRecord;
  action: string;
  metadata?: Record<string, unknown> | undefined;
  targetType?: string | undefined;
  targetId?: string | undefined;
}) {
  const timestamp = new Date().toISOString();
  const shifts = await listShiftsByOrganization(input.user.organizationId);
  const shift = resolveShiftForAction({
    user: input.user,
    branchId: input.incident.branchId,
    restroomId: input.incident.restroomId,
    timestamp,
    shifts,
  });
  const shouldDetectShift = !shift.shiftId && (isOperationsWorker(input.user) || isAreaManager(input.user));
  const detectedShift = shouldDetectShift
    ? await detectOrUpdateShiftFromActivity({
      user: input.user,
      actionType: input.action,
      branchId: input.incident.branchId,
      restroomId: input.incident.restroomId,
      timestamp,
    })
    : null;

  const log = await createActivityLog({
    organizationId: input.user.organizationId,
    actorUserId: input.user.id,
    actorFullName: input.user.fullName,
    actorRole: input.user.role,
    incidentId: input.incident.id,
    action: input.action,
    targetType: input.targetType ?? "incident",
    targetId: input.targetId ?? input.incident.id,
    branchId: input.incident.branchId,
    restroomId: input.incident.restroomId,
    shiftId: shift.shiftId,
    detectedShiftId: detectedShift?.id,
    metadata: {
      actorName: input.user.fullName,
      actorRole: input.user.role,
      shiftResolution: shift.shiftResolution,
      shiftLinkType: shift.shiftId ? "manual" : detectedShift ? "detected" : "none",
      detectedShiftStatus: detectedShift?.status,
      ...input.metadata,
    },
  });

  if (detectedShift) {
    await attachActivityLogToDetectedShift(input.user.organizationId, detectedShift.id, log.id);
  }

  return log;
}

export async function acknowledgeIncidentAction(incidentId: string) {
  const user = await requireUser();

  // Fetch incident (automatically validates organizationId ownership)
  const incident = await getIncidentById(user.organizationId, incidentId);
  if (!incident) {
    throw new Error("הדיווח לא נמצא במערכת");
  }

  if (!canUpdateIncident(user, incident)) {
    throw new Error("אין הרשאה לעדכן את סטטוס הדיווח");
  }

  if (incident.status !== "open") {
    throw new Error("ניתן לאשר קבלה רק עבור דיווחים במצב פתוח");
  }

  await updateIncidentStatus({
    organizationId: user.organizationId,
    incidentId,
    status: "acknowledged",
    actorUserId: user.id,
  });

  await logIncidentAction({
    user,
    incident,
    action: "status_acknowledged",
  });

  revalidateIncidentViews(incidentId);
}

export async function startInProgressIncidentAction(incidentId: string) {
  const user = await requireUser();

  const incident = await getIncidentById(user.organizationId, incidentId);
  if (!incident) {
    throw new Error("הדיווח לא נמצא במערכת");
  }

  if (!canUpdateIncident(user, incident)) {
    throw new Error("אין הרשאה לעדכן את סטטוס הדיווח");
  }

  if (incident.status !== "open" && incident.status !== "acknowledged") {
    throw new Error("ניתן להתחיל טיפול רק עבור דיווחים במצב פתוח או שהתקבלו");
  }

  await updateIncidentStatus({
    organizationId: user.organizationId,
    incidentId,
    status: "in_progress",
    actorUserId: user.id,
  });

  await logIncidentAction({
    user,
    incident,
    action: "status_in_progress",
  });

  revalidateIncidentViews(incidentId);
}

export async function resolveIncidentAction(incidentId: string, resolutionNote?: string) {
  const user = await requireUser();

  const incident = await getIncidentById(user.organizationId, incidentId);
  if (!incident) {
    throw new Error("הדיווח לא נמצא במערכת");
  }

  if (!canUpdateIncident(user, incident)) {
    throw new Error("אין הרשאה לעדכן את סטטוס הדיווח");
  }

  if (incident.status === "resolved" || incident.status === "dismissed") {
    throw new Error("דיווח זה כבר סגור");
  }

  await updateIncidentStatus({
    organizationId: user.organizationId,
    incidentId,
    status: "resolved",
    actorUserId: user.id,
    resolvedByUserId: user.id,
    resolutionNote: resolutionNote || null,
  });

  await logIncidentAction({
    user,
    incident,
    action: "status_resolved",
    metadata: {
      resolutionNote: resolutionNote || "",
    },
  });

  revalidateIncidentViews(incidentId);
}

export async function dismissIncidentAction(incidentId: string, resolutionNote?: string) {
  const user = await requireUser();

  const incident = await getIncidentById(user.organizationId, incidentId);
  if (!incident) {
    throw new Error("הדיווח לא נמצא במערכת");
  }

  if (!canDismissIncident(user, incident)) {
    throw new Error("אין הרשאה לדחות את הדיווח");
  }

  if (incident.status === "resolved" || incident.status === "dismissed") {
    throw new Error("דיווח זה כבר סגור");
  }

  await updateIncidentStatus({
    organizationId: user.organizationId,
    incidentId,
    status: "dismissed",
    actorUserId: user.id,
    resolutionNote: resolutionNote || null,
  });

  await logIncidentAction({
    user,
    incident,
    action: "status_dismissed",
    metadata: {
      resolutionNote: resolutionNote || "",
    },
  });

  revalidateIncidentViews(incidentId);
}

export async function resetRestroomIncidentsAction(incidentId: string) {
  const user = await requireUser();

  const incident = await getIncidentById(user.organizationId, incidentId);
  if (!incident) {
    throw new Error("הדיווח לא נמצא במערכת");
  }

  if (!canResetRestroom(user, incident.restroomId, incident.branchId)) {
    throw new Error("אין הרשאה לאפס את מצב השירותים");
  }

  if (incident.status === "resolved" || incident.status === "dismissed") {
    throw new Error("דיווח זה כבר סגור");
  }

  const result = await resolveOpenIncidentsForRestroom({
    organizationId: user.organizationId,
    restroomId: incident.restroomId,
    actorUserId: user.id,
  });

  await logIncidentAction({
    user,
    incident,
    action: "restroom_reset",
    targetType: "restroom",
    targetId: incident.restroomId,
    metadata: {
      restroomId: incident.restroomId,
      resetAt: result.resetAt,
      closedCount: result.closedCount,
    },
  });

  revalidateIncidentViews(incidentId);

  return result;
}

export async function addIncidentNoteAction(incidentId: string, note: string) {
  const user = await requireUser();
  const incident = await getIncidentById(user.organizationId, incidentId);
  if (!incident) {
    throw new Error("הדיווח לא נמצא במערכת");
  }

  if (!canUpdateIncident(user, incident)) {
    throw new Error("אין הרשאה להוסיף הערה לדיווח");
  }

  const trimmedNote = note.trim();
  if (!trimmedNote) {
    throw new Error("צריך להזין הערה קצרה");
  }

  await logIncidentAction({
    user,
    incident,
    action: "worker_note",
    metadata: {
      note: trimmedNote.slice(0, 280),
    },
  });

  revalidateIncidentViews(incidentId);
}
