import { getDataAdapter } from "@/lib/data/get-data-adapter";
import type { OrganizationRecord } from "@/lib/data/types";
import { createPrefixedId, nowIso } from "./_shared";

const orgCache = new Map<string, { data: OrganizationRecord | null; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes cache TTL

export async function listOrganizations() {
  return getDataAdapter().list("organizations", {
    includeInactive: true,
    sortBy: "createdAt",
    sortDirection: "asc",
  });
}

export async function getOrganizationById(id: string): Promise<OrganizationRecord | null> {
  const now = Date.now();
  const cached = orgCache.get(id);

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const organization = await getDataAdapter().get("organizations", id);
  orgCache.set(id, { data: organization, timestamp: now });
  return organization;
}

export async function getOrganizationBySlug(slug: string): Promise<OrganizationRecord | null> {
  const cacheKey = `slug:${slug}`;
  const now = Date.now();
  const cached = orgCache.get(cacheKey);

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const [organization] = await getDataAdapter().query("organizations", {
    slug,
    includeInactive: true,
    limit: 1,
  });

  const result = organization ?? null;
  orgCache.set(cacheKey, { data: result, timestamp: now });
  return result;
}

export async function createOrganization(data: Omit<OrganizationRecord, "id" | "createdAt" | "updatedAt">): Promise<OrganizationRecord> {
  const id = createPrefixedId("org");
  const now = nowIso();
  const org: OrganizationRecord = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };
  const created = await getDataAdapter().create("organizations", org);
  orgCache.delete(id);
  if (org.slug) {
    orgCache.delete(`slug:${org.slug}`);
  }
  return created;
}

export async function updateOrganization(id: string, patch: Partial<Omit<OrganizationRecord, "id" | "createdAt" | "updatedAt">>): Promise<OrganizationRecord> {
  const now = nowIso();
  const updatedPatch = {
    ...patch,
    updatedAt: now,
  };
  const updated = await getDataAdapter().update("organizations", id, updatedPatch);
  orgCache.delete(id);
  if (updated.slug) {
    orgCache.delete(`slug:${updated.slug}`);
  }
  return updated;
}
