"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { canResolveIncident } from "@/lib/auth/permissions";
import {
  updateIncidentStatus,
  getIncidentById,
  resolveOpenIncidentsForRestroom,
} from "@/lib/data/repositories/incidents";
import { createActivityLog } from "@/lib/data/repositories/activity-logs";

export async function acknowledgeIncidentAction(incidentId: string) {
  const user = await requireUser();
  if (!canResolveIncident(user)) {
    throw new Error("אין הרשאה לעדכן את סטטוס הדיווח");
  }

  // Fetch incident (automatically validates organizationId ownership)
  const incident = await getIncidentById(user.organizationId, incidentId);
  if (!incident) {
    throw new Error("הדיווח לא נמצא במערכת");
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

  await createActivityLog({
    organizationId: user.organizationId,
    actorUserId: user.id,
    incidentId,
    action: "status_acknowledged",
    metadata: {
      actorName: user.fullName,
    },
  });

  revalidatePath("/admin/incidents");
  revalidatePath(`/admin/incidents/${incidentId}`);
}

export async function startInProgressIncidentAction(incidentId: string) {
  const user = await requireUser();
  if (!canResolveIncident(user)) {
    throw new Error("אין הרשאה לעדכן את סטטוס הדיווח");
  }

  const incident = await getIncidentById(user.organizationId, incidentId);
  if (!incident) {
    throw new Error("הדיווח לא נמצא במערכת");
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

  await createActivityLog({
    organizationId: user.organizationId,
    actorUserId: user.id,
    incidentId,
    action: "status_in_progress",
    metadata: {
      actorName: user.fullName,
    },
  });

  revalidatePath("/admin/incidents");
  revalidatePath(`/admin/incidents/${incidentId}`);
}

export async function resolveIncidentAction(incidentId: string, resolutionNote?: string) {
  const user = await requireUser();
  if (!canResolveIncident(user)) {
    throw new Error("אין הרשאה לעדכן את סטטוס הדיווח");
  }

  const incident = await getIncidentById(user.organizationId, incidentId);
  if (!incident) {
    throw new Error("הדיווח לא נמצא במערכת");
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

  await createActivityLog({
    organizationId: user.organizationId,
    actorUserId: user.id,
    incidentId,
    action: "status_resolved",
    metadata: {
      actorName: user.fullName,
      resolutionNote: resolutionNote || "",
    },
  });

  revalidatePath("/admin/incidents");
  revalidatePath(`/admin/incidents/${incidentId}`);
}

export async function dismissIncidentAction(incidentId: string, resolutionNote?: string) {
  const user = await requireUser();
  if (!canResolveIncident(user)) {
    throw new Error("אין הרשאה לעדכן את סטטוס הדיווח");
  }

  const incident = await getIncidentById(user.organizationId, incidentId);
  if (!incident) {
    throw new Error("הדיווח לא נמצא במערכת");
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

  await createActivityLog({
    organizationId: user.organizationId,
    actorUserId: user.id,
    incidentId,
    action: "status_dismissed",
    metadata: {
      actorName: user.fullName,
      resolutionNote: resolutionNote || "",
    },
  });

  revalidatePath("/admin/incidents");
  revalidatePath(`/admin/incidents/${incidentId}`);
}

export async function resetRestroomIncidentsAction(incidentId: string) {
  const user = await requireUser();
  if (!canResolveIncident(user)) {
    throw new Error("אין הרשאה לאפס את מצב השירותים");
  }

  const incident = await getIncidentById(user.organizationId, incidentId);
  if (!incident) {
    throw new Error("הדיווח לא נמצא במערכת");
  }

  if (incident.status === "resolved" || incident.status === "dismissed") {
    throw new Error("דיווח זה כבר סגור");
  }

  const result = await resolveOpenIncidentsForRestroom({
    organizationId: user.organizationId,
    restroomId: incident.restroomId,
    actorUserId: user.id,
  });

  await createActivityLog({
    organizationId: user.organizationId,
    actorUserId: user.id,
    incidentId,
    action: "restroom_reset",
    metadata: {
      actorName: user.fullName,
      restroomId: incident.restroomId,
      resetAt: result.resetAt,
      closedCount: result.closedCount,
    },
  });

  return result;
}
