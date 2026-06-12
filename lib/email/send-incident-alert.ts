import type { IncidentRecord } from "@/lib/data/types";
import { resolveIncidentRecipients } from "./resolve-incident-recipients";
import { renderBrandedEmailTemplate } from "./branded-email-templates";
import { getEmailProvider } from "./get-email-provider";
import { MockEmailProvider } from "./mock-email-provider";
import { getBranchById } from "@/lib/data/repositories/branches";
import { getRestroomById } from "@/lib/data/repositories/restrooms";
import { getScreenById } from "@/lib/data/repositories/screens";
import { getIssueTypeByKey } from "@/lib/data/repositories/issue-types";
import { createNotificationLog } from "@/lib/data/repositories/notification-logs";
import { getUserByEmail } from "@/lib/data/repositories/users";
import { getEmailDomainSettings, isRecipientAllowedByEmailMode } from "@/lib/data/repositories/system-settings";
import { createMagicLoginLink } from "@/lib/auth/magic-login";
import type { IssueTypeKey } from "@/types/domain";

export async function sendIncidentAlert(incident: IncidentRecord): Promise<void> {
  const orgId = incident.organizationId;

  try {
    // 1. Resolve recipients hierarchy (screen -> restroom -> branch -> organization)
    const recipients = await resolveIncidentRecipients({
      organizationId: orgId,
      branchId: incident.branchId,
      restroomId: incident.restroomId,
      screenId: incident.screenId,
    });

    // 2. If no recipients exist, log as "no_recipients" and return
    if (recipients.length === 0) {
      await createNotificationLog({
        organizationId: orgId,
        incidentId: incident.id,
        recipientId: null,
        provider: "mock",
        status: "no_recipients",
      });
      return;
    }

    // 3. Retrieve location and issue details for rendering
    const branch = await getBranchById(orgId, incident.branchId);
    const restroom = await getRestroomById(orgId, incident.restroomId);
    const screen = await getScreenById(orgId, incident.screenId);

    let issueLabel = "";
    if (incident.issueKey) {
      const issueType = await getIssueTypeByKey(incident.issueKey as IssueTypeKey);
      issueLabel = issueType?.labelHe ?? incident.issueKey;
    } else if (incident.rating !== null) {
      issueLabel = `דירוג ${incident.rating}/5 כוכבים`;
    }

    const branchName = branch?.name ?? "סניף לא ידוע";
    const restroomName = restroom?.name ?? "אזור שירותים לא ידוע";
    const screenName = screen?.name ?? "מסך לא ידוע";

    const settings = await getEmailDomainSettings();
    const isUrgent = incident.priority === "high" || incident.priority === "critical";
    const template = isUrgent ? "urgent_incident_alert" : "incident_alert";
    const purpose = isUrgent ? "urgent_incident_alert" : "incident_alert";
    const targetPath = `/admin/incidents/${incident.id}`;
    const fallbackAdminUrl = `${settings.appUrl}${targetPath}`;
    const provider = settings.emailMode === "mock" ? new MockEmailProvider() : getEmailProvider();

    // 6. Send to each recipient in separate try-catches
    for (const recipient of recipients) {
      if (!recipient.enabled) continue;

      try {
        if (settings.emailMode === "test" && !isRecipientAllowedByEmailMode(settings, recipient.email)) {
          await createNotificationLog({
            organizationId: orgId,
            incidentId: incident.id,
            recipientId: recipient.id,
            provider: "mock",
            status: "failed",
            errorMessage: "נמען לא נמצא ברשימת allowedTestRecipients ולכן לא נשלח מייל.",
          });
          continue;
        }

        const recipientUser = await getUserByEmail(orgId, recipient.email);
        let ctaUrl = fallbackAdminUrl;
        let magicLinkGenerated = false;

        if (recipientUser?.isActive) {
          const magicLink = await createMagicLoginLink({
            user: recipientUser,
            purpose,
            targetPath,
            metadata: {
              incidentId: incident.id,
              notificationRecipientId: recipient.id,
            },
          });
          ctaUrl = magicLink.url;
          magicLinkGenerated = true;
        }

        const { subject, html, text } = renderBrandedEmailTemplate({
          template,
          ctaUrl,
          targetPath,
          recipientName: recipient.name,
          organizationName: "CleanPulse",
          details: [
            { label: "סניף", value: branchName },
            { label: "אזור שירותים", value: restroomName },
            { label: "מסך", value: screenName },
            { label: incident.issueKey ? "דיווח" : "ציון כללי", value: issueLabel },
            ...(incident.rating !== null && incident.issueKey ? [{ label: "ציון כללי", value: `${incident.rating}/5` }] : []),
            { label: "עדיפות", value: incident.priority },
          ],
          magicLinkGenerated,
        });

        const result = await provider.send({
          to: [recipient.email],
          subject,
          html,
          text,
          replyTo: settings.replyToEmail || undefined,
        });

        // Determine log status based on provider mode
        const status = provider.mode === "mock" ? "mock_sent" : "sent";

        await createNotificationLog({
          organizationId: orgId,
          incidentId: incident.id,
          recipientId: recipient.id,
          provider: provider.mode,
          status,
          providerMessageId: result.id,
        });
      } catch (sendError) {
        console.error(`Failed to send incident alert to recipient ${recipient.email}:`, sendError);
        
        // Write failed log in case of errors
        await createNotificationLog({
          organizationId: orgId,
          incidentId: incident.id,
          recipientId: recipient.id,
          provider: provider.mode,
          status: "failed",
          errorMessage: sendError instanceof Error ? sendError.message : String(sendError),
        });
      }
    }
  } catch (error) {
    console.error("Critical error in sendIncidentAlert wrapper:", error);
    // Important: Do not rethrow, so that the incident creation is never blocked
  }
}
