import type {
  BranchRecord,
  IncidentRecord,
  RestroomRecord,
  SafeUserRecord,
  ScreenRecord,
} from "@/lib/data/types";
import type { UserRole } from "@/types/domain";

type RoleUser = Pick<SafeUserRecord, "role">;
type ScopedUser = Pick<
  SafeUserRecord,
  "role" | "allowedBranchIds" | "allowedRestroomIds" | "assignedRestroomIds"
>;

export const roleLabels: Record<UserRole, string> = {
  super_admin: "מנהל על",
  owner: "בעלים",
  admin: "מנהל עסק",
  area_manager: "מנהל אזור",
  operations_worker: "עובד תפעולי",
  manager: "מנהל אזור",
  cleaner: "עובד תפעולי",
};

const organizationOwnerRoles = new Set<UserRole>(["owner", "admin"]);
const areaManagerRoles = new Set<UserRole>(["area_manager", "manager"]);
const operationsWorkerRoles = new Set<UserRole>(["operations_worker", "cleaner"]);
const incidentOperatorRoles = new Set<UserRole>([
  "owner",
  "admin",
  "area_manager",
  "manager",
  "operations_worker",
  "cleaner",
]);

export function formatRoleLabel(role: UserRole) {
  return roleLabels[role];
}

export function getDefaultRouteForRole(role: UserRole) {
  if (role === "super_admin") {
    return "/super/dashboard";
  }

  if (role === "operations_worker" || role === "cleaner") {
    return "/work";
  }

  return "/admin/dashboard";
}

export function isSuperAdmin(user: RoleUser) {
  return user.role === "super_admin";
}

export function isOrganizationOwner(user: RoleUser) {
  return organizationOwnerRoles.has(user.role);
}

export function isAreaManager(user: RoleUser) {
  return areaManagerRoles.has(user.role);
}

export function isOperationsWorker(user: RoleUser) {
  return operationsWorkerRoles.has(user.role);
}

export function isPrivilegedRole(role: UserRole) {
  return organizationOwnerRoles.has(role);
}

export function hasRole(user: RoleUser, roles: UserRole[]) {
  return roles.includes(user.role);
}

export function requireRole<T extends RoleUser>(user: T, roles: UserRole[]) {
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

function ids(values?: string[] | undefined) {
  return new Set((values ?? []).filter(Boolean));
}

function hasAnyScope(user: ScopedUser) {
  return Boolean(
    user.allowedBranchIds?.length ||
    user.allowedRestroomIds?.length ||
    user.assignedRestroomIds?.length,
  );
}

function hasFullOrganizationAccess(user: ScopedUser) {
  if (isOrganizationOwner(user)) {
    return true;
  }

  // Backward compatibility: old manager users existed before scopes.
  // They keep organization-level access until an explicit scope is assigned.
  return isAreaManager(user) && !hasAnyScope(user);
}

function getRestroomId(restroom: RestroomRecord | string) {
  return typeof restroom === "string" ? restroom : restroom.id;
}

function getBranchId(restroomOrBranch: RestroomRecord | BranchRecord | string, fallbackBranchId?: string | undefined) {
  if (typeof restroomOrBranch === "string") {
    return fallbackBranchId;
  }

  if ("branchId" in restroomOrBranch) {
    return restroomOrBranch.branchId;
  }

  return restroomOrBranch.id;
}

function canAccessScopedLocation(
  user: ScopedUser,
  location: { branchId?: string | undefined; restroomId?: string | undefined },
) {
  if (hasFullOrganizationAccess(user)) {
    return true;
  }

  const branchIds = ids(user.allowedBranchIds);
  const restroomIds = ids(user.allowedRestroomIds);
  const assignedRestroomIds = ids(user.assignedRestroomIds);

  if (location.restroomId && (restroomIds.has(location.restroomId) || assignedRestroomIds.has(location.restroomId))) {
    return true;
  }

  if (location.branchId && branchIds.has(location.branchId)) {
    return true;
  }

  return false;
}

export function canManageUsers(user: RoleUser) {
  return isOrganizationOwner(user);
}

export function canManageOrganizationSettings(user: RoleUser) {
  return isOrganizationOwner(user);
}

export function canManageSettings(user: RoleUser) {
  return canManageOrganizationSettings(user);
}

export function canManageRecipients(user: RoleUser) {
  return isOrganizationOwner(user);
}

export function canViewReports(user: RoleUser) {
  return isOrganizationOwner(user) || isAreaManager(user);
}

export function canResolveIncident(user: RoleUser) {
  return incidentOperatorRoles.has(user.role);
}

export function canViewIncidents(user: RoleUser) {
  return incidentOperatorRoles.has(user.role);
}

export function canViewLocations(user: RoleUser) {
  return isOrganizationOwner(user) || isAreaManager(user);
}

export function canViewScreens(user: RoleUser) {
  return isOrganizationOwner(user) || isAreaManager(user);
}

export function canViewSettings(user: RoleUser) {
  return canManageOrganizationSettings(user);
}

export function canViewBranch(user: ScopedUser, branchId: string) {
  return canAccessScopedLocation(user, { branchId });
}

export function canViewRestroom(user: ScopedUser, restroom: RestroomRecord | string, branchId?: string | undefined) {
  return canAccessScopedLocation(user, {
    restroomId: getRestroomId(restroom),
    branchId: getBranchId(restroom, branchId),
  });
}

export function canViewIncident(user: ScopedUser, incident: IncidentRecord) {
  if (!canViewIncidents(user)) {
    return false;
  }

  return canAccessScopedLocation(user, {
    branchId: incident.branchId,
    restroomId: incident.restroomId,
  });
}

export function canUpdateIncident(user: ScopedUser, incident: IncidentRecord) {
  if (!canResolveIncident(user)) {
    return false;
  }

  return canViewIncident(user, incident);
}

export function canDismissIncident(user: ScopedUser, incident: IncidentRecord) {
  if (isOperationsWorker(user)) {
    return false;
  }

  return canUpdateIncident(user, incident);
}

export function canResetRestroom(user: ScopedUser, restroom: RestroomRecord | string, branchId?: string | undefined) {
  if (!canResolveIncident(user)) {
    return false;
  }

  return canViewRestroom(user, restroom, branchId);
}

export function filterIncidentsForUser<T extends IncidentRecord>(user: ScopedUser, incidents: T[]) {
  return incidents.filter((incident) => canViewIncident(user, incident));
}

export function filterRestroomsForUser<T extends RestroomRecord>(user: ScopedUser, restrooms: T[]) {
  return restrooms.filter((restroom) => canViewRestroom(user, restroom));
}

export function filterBranchesForUser<T extends BranchRecord>(
  user: ScopedUser,
  branches: T[],
  restrooms: RestroomRecord[] = [],
) {
  if (hasFullOrganizationAccess(user)) {
    return branches;
  }

  const directlyAllowedBranchIds = ids(user.allowedBranchIds);
  const visibleRestroomBranchIds = new Set(
    restrooms.filter((restroom) => canViewRestroom(user, restroom)).map((restroom) => restroom.branchId),
  );

  return branches.filter((branch) => directlyAllowedBranchIds.has(branch.id) || visibleRestroomBranchIds.has(branch.id));
}

export function filterScreensForUser<T extends ScreenRecord>(user: ScopedUser, screens: T[]) {
  return screens.filter((screen) =>
    canAccessScopedLocation(user, {
      branchId: screen.branchId,
      restroomId: screen.restroomId,
    }),
  );
}

export function assertSameOrganization(user: Pick<SafeUserRecord, "organizationId">, organizationId: string) {
  if (user.organizationId !== organizationId) {
    throw new Error("CROSS_ORGANIZATION_ACCESS");
  }

  return true;
}
