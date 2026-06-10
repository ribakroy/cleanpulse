import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SafeUserRecord } from "@/lib/data/types";
import { env } from "@/lib/utils/env";
import type { UserRole } from "@/types/domain";

export const SESSION_COOKIE_NAME = "cleanpulse_session";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const DEV_AUTH_SECRET = "cleanpulse-local-dev-auth-secret";

export type SessionUser = {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export type AppSession = {
  user: SessionUser;
  issuedAt: string;
  expiresAt: string;
};

type SessionTokenPayload = {
  sub: string;
  organizationId: string;
  email: string;
  fullName: string;
  role: UserRole;
  iat: number;
  exp: number;
};

function getAuthSecret() {
  if (env.authSecret) {
    return env.authSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production.");
  }

  return DEV_AUTH_SECRET;
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url<T>(value: string): T | null {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

function signValue(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function isValidSignature(signature: string, expectedSignature: string) {
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}

function toSessionUser(user: Pick<SafeUserRecord, "id" | "organizationId" | "email" | "fullName" | "role">): SessionUser {
  return {
    id: user.id,
    organizationId: user.organizationId,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
}

function serializeSessionToken(user: SessionUser) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + SESSION_TTL_SECONDS;
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = encodeBase64Url(
    JSON.stringify({
      sub: user.id,
      organizationId: user.organizationId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      iat: issuedAt,
      exp: expiresAt,
    } satisfies SessionTokenPayload),
  );
  const signature = signValue(`${header}.${payload}`);

  return {
    token: `${header}.${payload}.${signature}`,
    expiresAt: new Date(expiresAt * 1000),
  };
}

function parseSessionToken(token: string): AppSession | null {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    return null;
  }

  const decodedHeader = decodeBase64Url<{ alg?: string; typ?: string }>(header);

  if (decodedHeader?.alg !== "HS256" || decodedHeader.typ !== "JWT") {
    return null;
  }

  const expectedSignature = signValue(`${header}.${payload}`);

  if (!isValidSignature(signature, expectedSignature)) {
    return null;
  }

  const decodedPayload = decodeBase64Url<SessionTokenPayload>(payload);

  if (
    !decodedPayload?.sub ||
    !decodedPayload.organizationId ||
    !decodedPayload.email ||
    !decodedPayload.fullName ||
    !decodedPayload.role ||
    typeof decodedPayload.iat !== "number" ||
    typeof decodedPayload.exp !== "number"
  ) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);

  if (decodedPayload.exp <= now) {
    return null;
  }

  return {
    user: {
      id: decodedPayload.sub,
      organizationId: decodedPayload.organizationId,
      email: decodedPayload.email,
      fullName: decodedPayload.fullName,
      role: decodedPayload.role,
    },
    issuedAt: new Date(decodedPayload.iat * 1000).toISOString(),
    expiresAt: new Date(decodedPayload.exp * 1000).toISOString(),
  };
}

function getCookieExpiresAt() {
  return new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
}

function getCookieConfig(expires: Date) {
  const isExpired = expires.getTime() <= Date.now();
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
    maxAge: isExpired ? 0 : SESSION_TTL_SECONDS,
  };
}


export async function createSessionCookie(user: Pick<SafeUserRecord, "id" | "organizationId" | "email" | "fullName" | "role">) {
  const sessionUser = toSessionUser(user);
  const { token, expiresAt } = serializeSessionToken(sessionUser);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, getCookieConfig(expiresAt));

  return {
    token,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function verifySessionCookie() {
  const cookieStore = await cookies();
  const rawSessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawSessionCookie) {
    return null;
  }

  return parseSessionToken(rawSessionCookie);
}

export async function getCurrentSession() {
  return verifySessionCookie();
}

export async function getCurrentUser(): Promise<SafeUserRecord | null> {
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  return {
    id: session.user.id,
    organizationId: session.user.organizationId,
    email: session.user.email,
    fullName: session.user.fullName,
    role: session.user.role,
    isActive: true,
    createdAt: session.issuedAt,
    updatedAt: session.issuedAt,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireUser();

  if (user.role !== "owner" && user.role !== "admin") {
    redirect("/admin/dashboard");
  }

  return user;
}

export async function requireSuperAdmin() {
  const user = await requireUser();

  if (user.role !== "super_admin") {
    redirect("/admin/dashboard");
  }

  return user;
}

export async function clearSession() {
  const cookieStore = await cookies();
  const clearedExpiresAt = new Date(0);

  cookieStore.set(SESSION_COOKIE_NAME, "", getCookieConfig(clearedExpiresAt));
}

export function getSessionMaxAgeSeconds() {
  return SESSION_TTL_SECONDS;
}

export function getSessionCookieExpiration() {
  return getCookieExpiresAt().toISOString();
}
