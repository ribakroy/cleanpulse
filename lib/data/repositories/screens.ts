import { randomUUID } from "node:crypto";
import { DataLayerError } from "@/lib/data/errors";
import { getDataAdapter } from "@/lib/data/get-data-adapter";
import { ensureOrganizationOwnership } from "@/lib/data/repositories/_shared";

export async function listScreensByOrganization(organizationId: string) {
  return getDataAdapter().query("screens", {
    organizationId,
    includeInactive: true,
    sortBy: "createdAt",
    sortDirection: "asc",
  });
}

export async function getScreenById(organizationId: string, id: string) {
  return ensureOrganizationOwnership("screens", organizationId, await getDataAdapter().get("screens", id));
}

export async function findScreenByPublicToken(token: string) {
  const [screen] = await getDataAdapter().query("screens", {
    publicToken: token,
    includeInactive: true,
    limit: 1,
  });

  return screen ?? null;
}

export async function findScreenByQrToken(token: string) {
  const [screen] = await getDataAdapter().query("screens", {
    qrToken: token,
    includeInactive: true,
    limit: 1,
  });

  return screen ?? null;
}

export async function assertScreenMatchesRestroom(organizationId: string, screenId: string, restroomId: string) {
  const screen = await getScreenById(organizationId, screenId);

  if (!screen) {
    throw new DataLayerError("SCREEN_NOT_FOUND", `Screen "${screenId}" was not found.`);
  }

  if (screen.restroomId !== restroomId) {
    throw new DataLayerError("SCREEN_RESTROOM_MISMATCH", `Screen "${screenId}" does not belong to restroom "${restroomId}".`);
  }

  return screen;
}

export async function createScreen(organizationId: string, data: { branchId: string; restroomId: string; name: string; isActive: boolean }) {
  return getDataAdapter().create("screens", {
    id: randomUUID(),
    organizationId,
    publicToken: randomUUID(),
    qrToken: randomUUID(),
    lastSeenAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data,
  });
}

export async function updateScreen(organizationId: string, id: string, data: Partial<{ branchId: string; restroomId: string; name: string; isActive: boolean }>) {
  await ensureOrganizationOwnership("screens", organizationId, await getDataAdapter().get("screens", id));
  return getDataAdapter().update("screens", id, { ...data, updatedAt: new Date().toISOString() });
}

export async function deactivateScreen(organizationId: string, id: string) {
  await ensureOrganizationOwnership("screens", organizationId, await getDataAdapter().get("screens", id));
  return getDataAdapter().update("screens", id, { isActive: false, updatedAt: new Date().toISOString() });
}

export async function regenerateScreenTokens(organizationId: string, id: string) {
  await ensureOrganizationOwnership("screens", organizationId, await getDataAdapter().get("screens", id));
  return getDataAdapter().update("screens", id, {
    publicToken: randomUUID(),
    qrToken: randomUUID(),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateScreenLastSeen(id: string) {
  try {
    return await getDataAdapter().update("screens", id, {
      lastSeenAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to update screen lastSeenAt:", error);
  }
}

