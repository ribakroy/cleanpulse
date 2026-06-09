import { getDataAdapter } from "@/lib/data/get-data-adapter";
import type { NotificationRecipientRecord } from "@/lib/data/types";
import type { NotificationScopeType } from "@/types/domain";

export async function listNotificationRecipientsByOrganization(organizationId: string) {
  return getDataAdapter().query("notification_recipients", {
    organizationId,
    includeInactive: true,
    sortBy: "createdAt",
    sortDirection: "asc",
  });
}

export async function listNotificationRecipientsForScope(
  organizationId: string,
  scopeType: NotificationScopeType,
  scopeId: string,
) {
  return getDataAdapter().query("notification_recipients", {
    organizationId,
    scopeType,
    scopeId,
    enabled: true,
    includeInactive: true,
    sortBy: "createdAt",
    sortDirection: "asc",
  });
}

export async function resolveNotificationRecipientsHierarchy(input: {
  organizationId: string;
  branchId: string;
  restroomId: string;
  screenId: string;
}) {
  const scopes: Array<{ scopeType: NotificationScopeType; scopeId: string }> = [
    { scopeType: "screen", scopeId: input.screenId },
    { scopeType: "restroom", scopeId: input.restroomId },
    { scopeType: "branch", scopeId: input.branchId },
    { scopeType: "organization", scopeId: input.organizationId },
  ];

  for (const scope of scopes) {
    const recipients = await listNotificationRecipientsForScope(input.organizationId, scope.scopeType, scope.scopeId);

    if (recipients.length > 0) {
      return {
        scopeType: scope.scopeType,
        recipients,
      };
    }
  }

  return {
    scopeType: "organization" as const,
    recipients: [] as NotificationRecipientRecord[],
  };
}

export async function createNotificationRecipient(
  organizationId: string,
  data: { scopeType: NotificationScopeType; scopeId: string; name: string; email: string; enabled: boolean }
) {
  return getDataAdapter().create("notification_recipients", {
    id: crypto.randomUUID(),
    organizationId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data,
  });
}

export async function updateNotificationRecipient(
  organizationId: string,
  id: string,
  data: Partial<{ scopeType: NotificationScopeType; scopeId: string; name: string; email: string; enabled: boolean }>
) {
  const record = await getDataAdapter().get("notification_recipients", id);
  if (!record || record.organizationId !== organizationId) throw new Error("Not found or unauthorized");
  return getDataAdapter().update("notification_recipients", id, { ...data, updatedAt: new Date().toISOString() });
}

export async function deactivateNotificationRecipient(organizationId: string, id: string) {
  const record = await getDataAdapter().get("notification_recipients", id);
  if (!record || record.organizationId !== organizationId) throw new Error("Not found or unauthorized");
  return getDataAdapter().update("notification_recipients", id, { enabled: false, updatedAt: new Date().toISOString() });
}
