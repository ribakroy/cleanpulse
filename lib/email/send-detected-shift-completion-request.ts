import { createMagicLoginLink } from "@/lib/auth/magic-login";
import { createActivityLog } from "@/lib/data/repositories/activity-logs";
import { markDetectedShiftCompletionRequested } from "@/lib/data/repositories/detected-shifts";
import { createNotificationLog } from "@/lib/data/repositories/notification-logs";
import { listUsersByOrganization } from "@/lib/data/repositories/users";
import type { DetectedShiftRecord, SafeUserRecord } from "@/lib/data/types";
import { formatRoleLabel } from "@/lib/auth/permissions";
import { getEmailDomainSettings } from "@/lib/data/repositories/system-settings";
import { MockEmailProvider } from "@/lib/email/mock-email-provider";
import { renderBrandedEmailTemplate } from "@/lib/email/branded-email-templates";

const missingFieldLabels: Record<string, string> = {
  branchId: "סניף",
  restroomIds: "אזורי שירותים",
  assignedUserIds: "עובדים",
  managerUserId: "מנהל משמרת",
  confirmedStartAt: "שעת התחלה מאושרת",
  confirmedEndAt: "שעת סיום מאושרת",
  shiftName: "שם משמרת",
  daysOfWeek: "ימי פעילות",
};

function formatMissingFields(missingFields: string[]) {
  return missingFields.map((field) => missingFieldLabels[field] ?? field).join(", ");
}

function selectRecipients(users: SafeUserRecord[], detectedShift: DetectedShiftRecord) {
  if (detectedShift.managerUserId) {
    const manager = users.find((user) => user.id === detectedShift.managerUserId && user.isActive !== false);
    if (manager) return [manager];
  }

  return users.filter((user) => user.isActive !== false && (user.role === "owner" || user.role === "admin"));
}

export async function sendDetectedShiftCompletionRequest(detectedShift: DetectedShiftRecord) {
  if (detectedShift.missingFields.length === 0 || detectedShift.completionRequestedAt) {
    return [];
  }

  const users = await listUsersByOrganization(detectedShift.organizationId);
  const recipients = selectRecipients(users, detectedShift);
  const settings = await getEmailDomainSettings();
  const provider = new MockEmailProvider();
  const targetPath = `/admin/shifts?detectedShiftId=${encodeURIComponent(detectedShift.id)}`;
  const sentUserIds: string[] = [];

  if (recipients.length === 0) {
    await createActivityLog({
      organizationId: detectedShift.organizationId,
      actorUserId: null,
      actorFullName: "CleanPulse",
      actorRole: null,
      incidentId: null,
      action: "detected_shift_completion_requested",
      actionType: "detected_shift_completion_requested",
      targetType: "detected_shift",
      targetId: detectedShift.id,
      branchId: detectedShift.branchId,
      detectedShiftId: detectedShift.id,
      metadata: {
        source: "system",
        missingFields: detectedShift.missingFields,
        confidence: detectedShift.confidence,
        recipientStatus: "no_manager_or_owner_found",
      },
    });
    return [];
  }

  for (const recipient of recipients) {
    const magicLink = await createMagicLoginLink({
      user: recipient,
      targetPath,
      purpose: "shift_completion_required",
      metadata: {
        detectedShiftId: detectedShift.id,
        missingFields: detectedShift.missingFields,
      },
      appUrl: settings.appUrl,
    });
    const { subject, html, text } = renderBrandedEmailTemplate({
      template: "shift_completion_required",
      ctaUrl: magicLink.url,
      targetPath,
      recipientName: recipient.fullName,
      organizationName: "CleanPulse",
      details: [
        { label: "סטטוס", value: detectedShift.status === "needs_completion" ? "דורש השלמה" : detectedShift.status },
        { label: "אמינות זיהוי", value: detectedShift.confidence ?? "low" },
        { label: "שדות חסרים", value: formatMissingFields(detectedShift.missingFields) || "אין" },
        { label: "תפקיד נמען", value: formatRoleLabel(recipient.role) },
      ],
      magicLinkGenerated: true,
    });
    const result = await provider.send({
      to: [recipient.email],
      subject,
      html,
      text,
      replyTo: settings.replyToEmail || undefined,
    });

    await createNotificationLog({
      organizationId: detectedShift.organizationId,
      targetType: "detected_shift",
      targetId: detectedShift.id,
      provider: "mock",
      status: "mock_sent",
      providerMessageId: result.id,
    });
    sentUserIds.push(recipient.id);
  }

  await markDetectedShiftCompletionRequested(detectedShift.organizationId, detectedShift.id, sentUserIds);
  await createActivityLog({
    organizationId: detectedShift.organizationId,
    actorUserId: null,
    actorFullName: "CleanPulse",
    actorRole: null,
    incidentId: null,
    action: "detected_shift_completion_requested",
    actionType: "detected_shift_completion_requested",
    targetType: "detected_shift",
    targetId: detectedShift.id,
    branchId: detectedShift.branchId,
    detectedShiftId: detectedShift.id,
    metadata: {
      source: "system",
      missingFields: detectedShift.missingFields,
      confidence: detectedShift.confidence,
      recipientUserIds: sentUserIds,
    },
  });

  return sentUserIds;
}
