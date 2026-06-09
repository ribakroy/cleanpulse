import type { IncidentRecord } from "@/lib/data/types";
import { resolveIncidentRecipients } from "./resolve-incident-recipients";
import { renderIncidentEmail } from "./render-incident-email";
import { getEmailProvider } from "./get-email-provider";
import { getBranchById } from "@/lib/data/repositories/branches";
import { getRestroomById } from "@/lib/data/repositories/restrooms";
import { getScreenById } from "@/lib/data/repositories/screens";
import { getIssueTypeByKey } from "@/lib/data/repositories/issue-types";
import { createNotificationLog } from "@/lib/data/repositories/notification-logs";
import { env } from "@/lib/utils/env";
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

    // Link in admin dashboard: detail views will be supported in future versions, for now direct to /admin/incidents
    const adminUrl = `${env.appUrl}/admin/incidents`;

    // 4. Render email subject, HTML and plain text
    const { subject, html, text } = renderIncidentEmail({
      incident,
      branchName,
      restroomName,
      screenName,
      issueLabel,
      adminUrl,
    });

    // 5. Get current active email provider
    const provider = getEmailProvider();

    // 6. Send to each recipient in separate try-catches
    for (const recipient of recipients) {
      if (!recipient.enabled) continue;

      try {
        const result = await provider.send({
          to: [recipient.email],
          subject,
          html,
          text,
          replyTo: env.emailReplyTo || undefined,
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
