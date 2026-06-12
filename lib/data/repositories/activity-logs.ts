import { getDataAdapter } from "@/lib/data/get-data-adapter";
import { createPrefixedId, nowIso } from "@/lib/data/repositories/_shared";
import type { ActivityLogRecord } from "@/lib/data/types";
import type { UserRole } from "@/types/domain";

export type CreateActivityLogInput = {
  organizationId: string;
  actorUserId?: string | null | undefined;
  actorFullName?: string | null | undefined;
  actorRole?: UserRole | null | undefined;
  incidentId?: string | null | undefined;
  action: string;
  actionType?: string | undefined;
  targetType?: string | undefined;
  targetId?: string | undefined;
  restroomId?: string | undefined;
  branchId?: string | undefined;
  shiftId?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
};

export async function listActivityLogsByOrganization(organizationId: string, options?: { limit?: number | undefined }) {
  return getDataAdapter().query("activity_logs", {
    organizationId,
    sortBy: "createdAt",
    sortDirection: "desc",
    limit: options?.limit,
  });
}

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
    actorFullName: input.actorFullName ?? null,
    actorRole: input.actorRole ?? null,
    incidentId: input.incidentId ?? null,
    action: input.action,
    actionType: input.actionType ?? input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    restroomId: input.restroomId,
    branchId: input.branchId,
    shiftId: input.shiftId,
    metadata: input.metadata ?? {},
    createdAt: nowIso(),
  };

  return getDataAdapter().appendLog("activity_logs", record);
}
