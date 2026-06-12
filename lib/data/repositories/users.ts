import { DataLayerError } from "@/lib/data/errors";
import { getDataAdapter } from "@/lib/data/get-data-adapter";
import type { SafeUserRecord, UserRecord } from "@/lib/data/types";
import { ensureOrganizationOwnership, normalizeEmail, sanitizeUserRecord, createPrefixedId, nowIso } from "@/lib/data/repositories/_shared";

export async function listUsersByOrganization(organizationId: string): Promise<SafeUserRecord[]> {
  const users = await getDataAdapter().query("users", {
    organizationId,
    includeInactive: true,
    sortBy: "createdAt",
    sortDirection: "asc",
  });

  return users.map(sanitizeUserRecord);
}

export async function getUserById(organizationId: string, id: string): Promise<SafeUserRecord | null> {
  const user = ensureOrganizationOwnership("users", organizationId, await getDataAdapter().get("users", id));

  return user ? sanitizeUserRecord(user) : null;
}

export async function getUserByEmail(organizationId: string, email: string): Promise<SafeUserRecord | null> {
  const normalizedEmail = normalizeEmail(email);
  const users = await getDataAdapter().query("users", {
    organizationId,
    includeInactive: true,
  });
  const user = users.find((candidate) => normalizeEmail(candidate.email) === normalizedEmail) ?? null;

  return user ? sanitizeUserRecord(user) : null;
}

export async function getUserByEmailForAuth(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const users = await getDataAdapter().list("users", {
    includeInactive: true,
    sortBy: "createdAt",
    sortDirection: "asc",
  });

  return users.find((candidate) => normalizeEmail(candidate.email) === normalizedEmail) ?? null;
}

export async function assertUserInOrganization(organizationId: string, userId: string) {
  const user = await getDataAdapter().get("users", userId);

  if (!user) {
    throw new DataLayerError("USER_NOT_FOUND", `User "${userId}" was not found.`);
  }

  ensureOrganizationOwnership("users", organizationId, user);

  return user;
}

export async function createUser(data: Omit<UserRecord, "id" | "createdAt" | "updatedAt">): Promise<UserRecord> {
  const id = createPrefixedId("user");
  const now = nowIso();
  const user: UserRecord = {
    ...data,
    isActive: data.isActive ?? true,
    allowedBranchIds: data.allowedBranchIds ?? [],
    allowedRestroomIds: data.allowedRestroomIds ?? [],
    assignedRestroomIds: data.assignedRestroomIds ?? [],
    id,
    createdAt: now,
    updatedAt: now,
  };
  const created = await getDataAdapter().create("users", user);
  return created;
}

export async function updateUser(id: string, patch: Partial<Omit<UserRecord, "id" | "createdAt" | "updatedAt">>): Promise<UserRecord> {
  const now = nowIso();
  const updatedPatch = {
    ...patch,
    updatedAt: now,
  };
  const updated = await getDataAdapter().update("users", id, updatedPatch);
  return updated;
}
