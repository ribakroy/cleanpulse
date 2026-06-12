import { createActivityLog } from "@/lib/data/repositories/activity-logs";
import {
  createMagicLoginToken,
  getMagicLoginTokenByRawToken,
  getMagicLoginTokenState,
  markMagicLoginTokenUsed,
} from "@/lib/data/repositories/magic-login-tokens";
import { getEmailDomainSettings } from "@/lib/data/repositories/system-settings";
import { getIncidentById } from "@/lib/data/repositories/incidents";
import { getUserById } from "@/lib/data/repositories/users";
import type { SafeUserRecord } from "@/lib/data/types";
import {
  canManageRecipients,
  canManageSettings,
  canManageUsers,
  canViewIncident,
  canViewLocations,
  canViewReports,
  canViewScreens,
  getDefaultRouteForRole,
  isAreaManager,
  isOperationsWorker,
  isOrganizationOwner,
  isSuperAdmin,
} from "@/lib/auth/permissions";
import type { MagicLoginPurpose } from "@/types/domain";

export type CreateMagicLoginLinkInput = {
  user: Pick<SafeUserRecord, "id" | "organizationId">;
  targetPath: string;
  purpose: MagicLoginPurpose;
  ttlMinutes?: number | undefined;
  createdByUserId?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  appUrl?: string | undefined;
};

export type ConsumeMagicLoginResult =
  | { ok: true; user: SafeUserRecord; redirectPath: string; targetPath: string; authorizedTarget: boolean }
  | { ok: false; reason: "invalid" | "expired" | "used" | "revoked" | "inactive" };

export function normalizeMagicTargetPath(targetPath: string) {
  const trimmed = targetPath.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return null;
  }

  try {
    const parsed = new URL(trimmed, "https://cleanpulse.local");

    if (parsed.origin !== "https://cleanpulse.local") {
      return null;
    }

    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

function isAdminDashboardTarget(targetPath: string) {
  return targetPath === "/admin" || targetPath === "/admin/dashboard";
}

function getIncidentIdFromTarget(targetPath: string) {
  const pathname = targetPath.split("?")[0] ?? targetPath;
  const match = pathname.match(/^\/admin\/incidents\/([^/]+)$/);

  return match?.[1] ?? null;
}

export async function canUseMagicLoginTarget(user: SafeUserRecord, targetPath: string) {
  if (targetPath.startsWith("/super")) {
    return isSuperAdmin(user);
  }

  if (targetPath === "/work" || targetPath.startsWith("/work?")) {
    return isOperationsWorker(user);
  }

  if (targetPath.startsWith("/admin")) {
    if (isOperationsWorker(user) || isSuperAdmin(user)) {
      return false;
    }

    if (isAdminDashboardTarget(targetPath)) {
      return isOrganizationOwner(user) || isAreaManager(user);
    }

    if (targetPath.startsWith("/admin/users")) {
      return canManageUsers(user);
    }

    if (targetPath.startsWith("/admin/shifts")) {
      return canManageUsers(user);
    }

    if (targetPath.startsWith("/admin/settings")) {
      return canManageSettings(user);
    }

    if (targetPath.startsWith("/admin/recipients")) {
      return canManageRecipients(user);
    }

    if (targetPath.startsWith("/admin/reports")) {
      return canViewReports(user);
    }

    if (targetPath.startsWith("/admin/branches") || targetPath.startsWith("/admin/restrooms")) {
      return canViewLocations(user);
    }

    if (targetPath.startsWith("/admin/screens")) {
      return canViewScreens(user);
    }

    if (targetPath === "/admin/incidents" || targetPath.startsWith("/admin/incidents?")) {
      return isOrganizationOwner(user) || isAreaManager(user);
    }

    const incidentId = getIncidentIdFromTarget(targetPath);
    if (incidentId) {
      const incident = await getIncidentById(user.organizationId, incidentId).catch(() => null);

      return incident ? canViewIncident(user, incident) && !isOperationsWorker(user) : false;
    }
  }

  return false;
}

export async function createMagicLoginLink(input: CreateMagicLoginLinkInput) {
  const targetPath = normalizeMagicTargetPath(input.targetPath);

  if (!targetPath) {
    throw new Error("Invalid magic login targetPath.");
  }

  const { rawToken, record } = await createMagicLoginToken({
    organizationId: input.user.organizationId,
    userId: input.user.id,
    targetPath,
    purpose: input.purpose,
    ttlMinutes: input.ttlMinutes,
    createdByUserId: input.createdByUserId,
    metadata: input.metadata,
  });
  const settings = input.appUrl ? null : await getEmailDomainSettings();
  const appUrl = input.appUrl ?? settings?.appUrl ?? "https://cleanpulse-beryl.vercel.app";
  const url = new URL("/auth/magic", appUrl);
  url.searchParams.set("token", rawToken);

  return {
    url: url.toString(),
    rawToken,
    record,
  };
}

export async function consumeMagicLoginToken(rawToken: string): Promise<ConsumeMagicLoginResult> {
  const record = await getMagicLoginTokenByRawToken(rawToken);

  if (!record) {
    return { ok: false, reason: "invalid" };
  }

  const state = getMagicLoginTokenState(record);
  if (state !== "valid") {
    return { ok: false, reason: state };
  }

  const user = await getUserById(record.organizationId, record.userId).catch(() => null);
  if (!user || !user.isActive) {
    return { ok: false, reason: "inactive" };
  }

  const normalizedTargetPath = normalizeMagicTargetPath(record.targetPath);
  const fallbackPath = getDefaultRouteForRole(user.role);
  const targetPath = normalizedTargetPath ?? fallbackPath;
  const authorizedTarget = normalizedTargetPath ? await canUseMagicLoginTarget(user, normalizedTargetPath) : false;
  const redirectPath = authorizedTarget ? targetPath : fallbackPath;

  await markMagicLoginTokenUsed(record.id);
  await createActivityLog({
    organizationId: user.organizationId,
    actorUserId: user.id,
    actorFullName: user.fullName,
    actorRole: user.role,
    action: "magic_login_used",
    actionType: "magic_login_used",
    targetType: "magic_login",
    targetId: record.id,
    metadata: {
      purpose: record.purpose,
      targetPath,
      redirectPath,
      authorizedTarget,
    },
  });

  return {
    ok: true,
    user,
    redirectPath,
    targetPath,
    authorizedTarget,
  };
}
