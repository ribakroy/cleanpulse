import { getDataAdapter } from "@/lib/data/get-data-adapter";
import { createPrefixedId, ensureOrganizationOwnership, nowIso } from "@/lib/data/repositories/_shared";
import type { ShiftRecord } from "@/lib/data/types";

export async function listShiftsByOrganization(organizationId: string) {
  return getDataAdapter().query("shifts", {
    organizationId,
    includeInactive: true,
    sortBy: "createdAt",
    sortDirection: "asc",
  });
}

export async function getShiftById(organizationId: string, id: string) {
  return ensureOrganizationOwnership("shifts", organizationId, await getDataAdapter().get("shifts", id));
}

export async function createShift(input: Omit<ShiftRecord, "id" | "createdAt" | "updatedAt">) {
  const timestamp = nowIso();

  return getDataAdapter().create("shifts", {
    ...input,
    id: createPrefixedId("shift"),
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export async function updateShift(
  organizationId: string,
  id: string,
  patch: Partial<Omit<ShiftRecord, "id" | "organizationId" | "createdAt" | "updatedAt">>,
) {
  await ensureOrganizationOwnership("shifts", organizationId, await getDataAdapter().get("shifts", id));

  return getDataAdapter().update("shifts", id, {
    ...patch,
    updatedAt: nowIso(),
  });
}

export async function deactivateShift(organizationId: string, id: string) {
  await ensureOrganizationOwnership("shifts", organizationId, await getDataAdapter().get("shifts", id));

  return getDataAdapter().update("shifts", id, {
    isActive: false,
    updatedAt: nowIso(),
  });
}
