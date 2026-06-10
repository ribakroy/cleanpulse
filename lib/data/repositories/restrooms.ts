import { randomUUID } from "node:crypto";
import { DataLayerError } from "@/lib/data/errors";
import { getDataAdapter } from "@/lib/data/get-data-adapter";
import { ensureOrganizationOwnership } from "@/lib/data/repositories/_shared";

export async function listRestroomsByOrganization(organizationId: string) {
  return getDataAdapter().query("restrooms", {
    organizationId,
    includeInactive: true,
    sortBy: "createdAt",
    sortDirection: "asc",
  });
}

export async function getRestroomById(organizationId: string, id: string) {
  return ensureOrganizationOwnership("restrooms", organizationId, await getDataAdapter().get("restrooms", id));
}

export async function assertRestroomBelongsToBranch(organizationId: string, restroomId: string, branchId: string) {
  const restroom = await getRestroomById(organizationId, restroomId);

  if (!restroom) {
    throw new DataLayerError("RESTROOM_NOT_FOUND", `Restroom "${restroomId}" was not found.`);
  }

  if (restroom.branchId !== branchId) {
    throw new DataLayerError(
      "RESTROOM_BRANCH_MISMATCH",
      `Restroom "${restroomId}" does not belong to branch "${branchId}".`,
    );
  }

  return restroom;
}

export async function createRestroom(organizationId: string, data: { branchId: string; name: string; floor: string; areaDescription: string; isActive: boolean }) {
  return getDataAdapter().create("restrooms", {
    id: randomUUID(),
    organizationId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data,
  });
}

export async function updateRestroom(organizationId: string, id: string, data: Partial<{ branchId: string; name: string; floor: string; areaDescription: string; isActive: boolean }>) {
  await ensureOrganizationOwnership("restrooms", organizationId, await getDataAdapter().get("restrooms", id));
  return getDataAdapter().update("restrooms", id, { ...data, updatedAt: new Date().toISOString() });
}

export async function deactivateRestroom(organizationId: string, id: string) {
  await ensureOrganizationOwnership("restrooms", organizationId, await getDataAdapter().get("restrooms", id));
  return getDataAdapter().update("restrooms", id, { isActive: false, updatedAt: new Date().toISOString() });
}
