import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { DataLayerError } from "@/lib/data/errors";
import { getDataAdapter } from "@/lib/data/get-data-adapter";
import { createPrefixedId, nowIso } from "@/lib/data/repositories/_shared";
import type { MagicLoginTokenRecord } from "@/lib/data/types";
import type { MagicLoginPurpose } from "@/types/domain";

export const MAGIC_LOGIN_DEFAULT_TTL_MINUTES = 20;

export type CreateMagicLoginTokenInput = {
  organizationId: string;
  userId: string;
  targetPath: string;
  purpose: MagicLoginPurpose;
  ttlMinutes?: number | undefined;
  createdByUserId?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
};

export function createMagicLoginRawToken() {
  return randomBytes(32).toString("base64url");
}

export function hashMagicLoginToken(rawToken: string) {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

function isSameHash(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function createMagicLoginToken(input: CreateMagicLoginTokenInput) {
  const rawToken = createMagicLoginRawToken();
  const now = nowIso();
  const ttlMinutes = input.ttlMinutes ?? MAGIC_LOGIN_DEFAULT_TTL_MINUTES;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString();

  const record: MagicLoginTokenRecord = {
    id: createPrefixedId("magic_login"),
    organizationId: input.organizationId,
    userId: input.userId,
    tokenHash: hashMagicLoginToken(rawToken),
    targetPath: input.targetPath,
    purpose: input.purpose,
    expiresAt,
    createdByUserId: input.createdByUserId,
    metadata: input.metadata,
    createdAt: now,
    updatedAt: now,
  };

  const created = await getDataAdapter().create("magic_login_tokens", record);

  return {
    rawToken,
    record: created,
  };
}

export async function getMagicLoginTokenByRawToken(rawToken: string) {
  const tokenHash = hashMagicLoginToken(rawToken);
  const matches = await getDataAdapter().query("magic_login_tokens", {
    tokenHash,
    includeInactive: true,
    limit: 2,
  });

  return matches.find((record) => isSameHash(record.tokenHash, tokenHash)) ?? null;
}

export function getMagicLoginTokenState(record: MagicLoginTokenRecord, now = new Date()) {
  if (record.revokedAt) {
    return "revoked" as const;
  }

  if (record.usedAt) {
    return "used" as const;
  }

  if (new Date(record.expiresAt).getTime() <= now.getTime()) {
    return "expired" as const;
  }

  return "valid" as const;
}

export async function markMagicLoginTokenUsed(id: string) {
  return getDataAdapter().update("magic_login_tokens", id, {
    usedAt: nowIso(),
  });
}

export async function revokeMagicLoginToken(id: string) {
  const record = await getDataAdapter().get("magic_login_tokens", id);

  if (!record) {
    throw new DataLayerError("MAGIC_LOGIN_NOT_FOUND", `Magic login token "${id}" was not found.`);
  }

  return getDataAdapter().update("magic_login_tokens", id, {
    revokedAt: nowIso(),
  });
}
