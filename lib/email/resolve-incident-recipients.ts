import { resolveNotificationRecipientsHierarchy } from "@/lib/data/repositories/notification-recipients";
import type { NotificationRecipientRecord } from "@/lib/data/types";

export async function resolveIncidentRecipients(input: {
  organizationId: string;
  branchId: string;
  restroomId: string;
  screenId: string;
}): Promise<NotificationRecipientRecord[]> {
  const result = await resolveNotificationRecipientsHierarchy(input);
  return result.recipients;
}
