import { getDataAdapter } from "@/lib/data/get-data-adapter";
import { createPrefixedId, nowIso } from "@/lib/data/repositories/_shared";
import type { ActivityLogRecord } from "@/lib/data/types";

export type CreateActivityLogInput = {
  organizationId: string;
  actorUserId?: string | null | undefined;
  incidentId?: string | null | undefined;
  action: string;
  metadata?: Record<string, unknown> | undefined;
};

export async function listActivityLogsForIncident(organizationId: string, incidentId: string) {
  return getDataAdapter().query("activity_logs", {
    organizationId,
    incidentId,
    sortBy: "createdAt",
    sortDirection: "desc",
  });
}

export async function createActivityLog(input: CreateActivityLogInput) {
  const record: ActivityLogRecord = {
    id: createPrefixedId("activity_log"),
    organizationId: input.organizationId,
    actorUserId: input.actorUserId ?? null,
    incidentId: input.incidentId ?? null,
    action: input.action,
    metadata: input.metadata ?? {},
    createdAt: nowIso(),
  };

  return getDataAdapter().appendLog("activity_logs", record);
}
