"use server";

import { revalidatePath } from "next/cache";
import { canManageSettings } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { createActivityLog } from "@/lib/data/repositories/activity-logs";
import { resolveOpenIncidentsForOrganization } from "@/lib/data/repositories/incidents";
import { getOrganizationById, updateOrganization } from "@/lib/data/repositories/organizations";
import type { ClosingResetMode } from "@/lib/data/types";

const closingResetModes = new Set<ClosingResetMode>(["reset_open_incidents", "keep_open_incidents"]);

export type ClosingProcedureActionResult = {
  ok: boolean;
  message: string;
  closedCount?: number;
};

function requireSettingsManager(user: Awaited<ReturnType<typeof requireUser>>) {
  if (!canManageSettings(user)) {
    throw new Error("אין הרשאה לעדכן את הגדרות העסק");
  }
}

function parseClosingResetMode(value: FormDataEntryValue | null): ClosingResetMode {
  const mode = typeof value === "string" ? value : "keep_open_incidents";
  return closingResetModes.has(mode as ClosingResetMode) ? (mode as ClosingResetMode) : "keep_open_incidents";
}

function parseClosingTime(value: FormDataEntryValue | null) {
  const time = typeof value === "string" ? value.trim() : "";
  if (!time) {
    return undefined;
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new Error("שעת הסגירה צריכה להיות בפורמט HH:mm");
  }

  return time;
}

export async function updateClosingProcedureAction(formData: FormData): Promise<ClosingProcedureActionResult> {
  const user = await requireUser();
  requireSettingsManager(user);

  const closingTime = parseClosingTime(formData.get("closingTime"));
  const closingResetMode = parseClosingResetMode(formData.get("closingResetMode"));

  await updateOrganization(user.organizationId, {
    closingTime,
    closingResetMode,
  });

  revalidatePath("/admin/settings");

  return {
    ok: true,
    message: "נוהל הסגירה נשמר.",
  };
}

export async function runClosingResetNowAction(): Promise<ClosingProcedureActionResult> {
  const user = await requireUser();
  requireSettingsManager(user);

  const organization = await getOrganizationById(user.organizationId);
  const resetMode = organization?.closingResetMode ?? "keep_open_incidents";

  if (resetMode !== "reset_open_incidents") {
    return {
      ok: true,
      message: "העסק מוגדר להשאיר פניות פתוחות בסוף היום, לכן לא בוצע איפוס.",
      closedCount: 0,
    };
  }

  const result = await resolveOpenIncidentsForOrganization({
    organizationId: user.organizationId,
    actorUserId: user.id,
  });

  await createActivityLog({
    organizationId: user.organizationId,
    actorUserId: user.id,
    incidentId: null,
    action: "closing_reset_run",
    metadata: {
      actorName: user.fullName,
      resetAt: result.resetAt,
      closedCount: result.closedCount,
    },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/incidents");
  revalidatePath("/admin/settings");

  return {
    ok: true,
    message: `בוצע איפוס סוף יום. נסגרו ${result.closedCount} פניות פתוחות.`,
    closedCount: result.closedCount,
  };
}
