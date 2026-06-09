import { getDataAdapter } from "@/lib/data/get-data-adapter";

export async function listOrganizations() {
  return getDataAdapter().list("organizations", {
    includeInactive: true,
    sortBy: "createdAt",
    sortDirection: "asc",
  });
}

export async function getOrganizationById(id: string) {
  return getDataAdapter().get("organizations", id);
}

export async function getOrganizationBySlug(slug: string) {
  const [organization] = await getDataAdapter().query("organizations", {
    slug,
    includeInactive: true,
    limit: 1,
  });

  return organization ?? null;
}
