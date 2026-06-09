import { getDataAdapter } from "@/lib/data/get-data-adapter";
import { createPrefixedId, nowIso } from "@/lib/data/repositories/_shared";
import type { NotificationLogRecord } from "@/lib/data/types";
import type { NotificationChannel, NotificationLogStatus, NotificationProvider } from "@/types/domain";

export type CreateNotificationLogInput = {
  organizationId: string;
  incidentId: string;
  recipientId?: string | null | undefined;
  provider: NotificationProvider;
  channel?: NotificationChannel | undefined;
  status: NotificationLogStatus;
  providerMessageId?: string | null | undefined;
  errorMessage?: string | null | undefined;
};

export async function listNotificationLogsByIncident(organizationId: string, incidentId: string) {
  return getDataAdapter().query("notification_logs", {
    organizationId,
    incidentId,
    sortBy: "createdAt",
    sortDirection: "desc",
  });
}

export async function createNotificationLog(input: CreateNotificationLogInput) {
  const record: NotificationLogRecord = {
    id: createPrefixedId("notification_log"),
    organizationId: input.organizationId,
    incidentId: input.incidentId,
    recipientId: input.recipientId ?? null,
    provider: input.provider,
    channel: input.channel ?? "email",
    status: input.status,
    providerMessageId: input.providerMessageId ?? null,
    errorMessage: input.errorMessage ?? null,
    createdAt: nowIso(),
  };

  return getDataAdapter().appendLog("notification_logs", record);
}
