import type { SafeUserRecord } from "@/lib/data/types";
import type { UserRole } from "@/types/domain";

export const roleLabels: Record<UserRole, string> = {
  owner: "בעלים",
  admin: "אדמין",
  manager: "מנהל",
  cleaner: "צוות ניקיון",
};

export function formatRoleLabel(role: UserRole) {
  return roleLabels[role];
}

export function isPrivilegedRole(role: UserRole) {
  return role === "owner" || role === "admin";
}

export function hasRole(user: Pick<SafeUserRecord, "role">, roles: UserRole[]) {
  return roles.includes(user.role);
}

export function requireRole<T extends Pick<SafeUserRecord, "role">>(user: T, roles: UserRole[]) {
  if (!hasRole(user, roles)) {
    throw new Error("FORBIDDEN_ROLE");
  }

  return user;
}

export function requirePermission<T extends SafeUserRecord>(user: T, predicate: (candidate: T) => boolean) {
  if (!predicate(user)) {
    throw new Error("FORBIDDEN_PERMISSION");
  }

  return user;
}

export function canManageSettings(user: Pick<SafeUserRecord, "role">) {
  return isPrivilegedRole(user.role);
}

export function canManageRecipients(user: Pick<SafeUserRecord, "role">) {
  return isPrivilegedRole(user.role);
}

export function canViewReports(user: Pick<SafeUserRecord, "role">) {
  return user.role === "owner" || user.role === "admin" || user.role === "manager";
}

export function canResolveIncident(user: Pick<SafeUserRecord, "role">) {
  return user.role === "owner" || user.role === "admin" || user.role === "manager" || user.role === "cleaner";
}

export function canViewIncidents(user: Pick<SafeUserRecord, "role">) {
  return canResolveIncident(user);
}

export function canViewLocations(user: Pick<SafeUserRecord, "role">) {
  return user.role === "owner" || user.role === "admin" || user.role === "manager";
}

export function canViewScreens(user: Pick<SafeUserRecord, "role">) {
  return canViewLocations(user);
}

export function canViewSettings(user: Pick<SafeUserRecord, "role">) {
  return user.role === "owner" || user.role === "admin" || user.role === "manager";
}

export function assertSameOrganization(user: Pick<SafeUserRecord, "organizationId">, organizationId: string) {
  if (user.organizationId !== organizationId) {
    throw new Error("CROSS_ORGANIZATION_ACCESS");
  }

  return true;
}
