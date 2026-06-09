import { getDataAdapter } from "@/lib/data/get-data-adapter";
import type { IssueTypeKey } from "@/types/domain";

export async function listIssueTypes() {
  return getDataAdapter().list("issue_types", {
    includeInactive: false,
    sortBy: "sortOrder",
    sortDirection: "asc",
  });
}

export async function getIssueTypeById(id: string) {
  return getDataAdapter().get("issue_types", id);
}

export async function getIssueTypeByKey(key: IssueTypeKey) {
  const [issueType] = await getDataAdapter().query("issue_types", {
    key,
    includeInactive: true,
    limit: 1,
  });

  return issueType ?? null;
}
