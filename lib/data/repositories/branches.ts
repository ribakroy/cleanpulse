import { randomUUID } from "node:crypto";
import { getDataAdapter } from "@/lib/data/get-data-adapter";
import { ensureOrganizationOwnership } from "@/lib/data/repositories/_shared";

export async function listBranchesByOrganization(organizationId: string) {
  return getDataAdapter().query("branches", {
    organizationId,
    includeInactive: true,
    sortBy: "createdAt",
    sortDirection: "asc",
  });
}

export async function getBranchById(organizationId: string, id: string) {
  return ensureOrganizationOwnership("branches", organizationId, await getDataAdapter().get("branches", id));
}

export async function createBranch(organizationId: string, data: { name: string; address: string; city: string; isActive: boolean }) {
  return getDataAdapter().create("branches", {
    id: randomUUID(),
    organizationId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data,
  });
}

export async function updateBranch(organizationId: string, id: string, data: Partial<{ name: string; address: string; city: string; isActive: boolean }>) {
  await ensureOrganizationOwnership("branches", organizationId, await getDataAdapter().get("branches", id));
  return getDataAdapter().update("branches", id, { ...data, updatedAt: new Date().toISOString() });
}

export async function deactivateBranch(organizationId: string, id: string) {
  await ensureOrganizationOwnership("branches", organizationId, await getDataAdapter().get("branches", id));
  return getDataAdapter().update("branches", id, { isActive: false, updatedAt: new Date().toISOString() });
}
