import { randomUUID } from "node:crypto";
import { DataLayerError } from "@/lib/data/errors";
import type { CollectionName, CollectionRecord, SafeUserRecord, UserRecord } from "@/lib/data/types";

export function createPrefixedId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function sanitizeUserRecord(user: UserRecord): SafeUserRecord {
  const { passwordHash, ...safeUser } = user;
  void passwordHash;

  return {
    ...safeUser,
    isActive: safeUser.isActive ?? true,
    allowedBranchIds: safeUser.allowedBranchIds ?? [],
    allowedRestroomIds: safeUser.allowedRestroomIds ?? [],
    assignedRestroomIds: safeUser.assignedRestroomIds ?? [],
  };
}

export function ensureOrganizationOwnership<C extends CollectionName>(
  collection: C,
  organizationId: string,
  record: CollectionRecord<C> | null,
) {
  if (!record) {
    return null;
  }

  if ("organizationId" in record && record.organizationId !== organizationId) {
    throw new DataLayerError(
      "CROSS_ORGANIZATION_ACCESS",
      `Record "${record.id}" from collection "${collection}" does not belong to organization "${organizationId}".`,
    );
  }

  return record;
}

export function assertDefined<T>(value: T | null | undefined, message: string): T {
  if (value === null || typeof value === "undefined") {
    throw new DataLayerError("DATA_ASSERTION_FAILED", message);
  }

  return value;
}
