"use server";

import { z } from "zod";
import { findScreenByPublicToken, findScreenByQrToken } from "@/lib/data/repositories/screens";
import { getBranchById } from "@/lib/data/repositories/branches";
import { getRestroomById } from "@/lib/data/repositories/restrooms";
import { getIssueTypeByKey } from "@/lib/data/repositories/issue-types";
import { createIncident } from "@/lib/data/repositories/incidents";
import { createActivityLog } from "@/lib/data/repositories/activity-logs";
import { sendIncidentAlert } from "@/lib/email/send-incident-alert";
import type { IssueTypeKey } from "@/types/domain";

// In-memory rate limiter for local MVP development.
// Note: This is not suitable for stateless serverless production environments.
const rateLimitMap = new Map<string, number>();

function checkRateLimit(token: string, key: string, cooldownMs = 10000): boolean {
  const mapKey = `${token}:${key}`;
  const now = Date.now();
  const lastTime = rateLimitMap.get(mapKey);
  if (lastTime && now - lastTime < cooldownMs) {
    return false;
  }
  rateLimitMap.set(mapKey, now);

  // Keep size reasonable by cleaning up entries older than 1 minute
  if (rateLimitMap.size > 1000) {
    const threshold = now - 60000;
    for (const [k, v] of rateLimitMap.entries()) {
      if (v < threshold) {
        rateLimitMap.delete(k);
      }
    }
  }
  return true;
}

const inputSchema = z.object({
  token: z.string().min(1, "Token is required"),
  source: z.enum(["kiosk", "qr"]),
  issueKey: z.string().nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
}).refine(data => data.issueKey || data.rating, {
  message: "Incident requires either issueKey or rating",
}).refine(data => !(data.issueKey && data.rating), {
  message: "Incident cannot contain both issueKey and rating together",
});

export type PublicIncidentInput = {
  token: string;
  source: "kiosk" | "qr";
  issueKey?: IssueTypeKey | null;
  rating?: (1 | 2 | 3 | 4 | 5) | null;
};

export async function createPublicIncidentAction(input: PublicIncidentInput) {
  try {
    // 1. Zod input validation
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "קלט לא תקין",
      };
    }

    const { token, source, issueKey, rating } = parsed.data;

    // 2. Resolve screen by token and ensure it is active
    const screen = source === "kiosk"
      ? await findScreenByPublicToken(token)
      : await findScreenByQrToken(token);

    if (!screen || !screen.isActive) {
      return {
        success: false,
        error: "מסך זה אינו פעיל או שאינו קיים במערכת",
      };
    }

    // 3. Resolve and validate branch and restroom
    const branch = await getBranchById(screen.organizationId, screen.branchId);
    const restroom = await getRestroomById(screen.organizationId, screen.restroomId);

    if (!branch || !branch.isActive || !restroom || !restroom.isActive) {
      return {
        success: false,
        error: "הסניף או אזור השירותים אינם פעילים כרגע",
      };
    }

    // 4. Validate issueKey if provided, or rating
    if (issueKey) {
      const issueType = await getIssueTypeByKey(issueKey as IssueTypeKey);
      if (!issueType || !issueType.isActive) {
        return {
          success: false,
          error: "סוג התקלה שנבחר אינו פעיל או אינו קיים במערכת",
        };
      }
    }

    // 5. In-memory rate limiting check (server-side cooldown)
    const limitKey = issueKey ? `issue_${issueKey}` : `rating_${rating}`;
    if (!checkRateLimit(token, limitKey)) {
      return {
        success: false,
        error: "דיווח דומה התקבל לאחרונה ממסך זה. אנא המתן מספר שניות.",
      };
    }

    // 6. Create incident in repository
    const incident = await createIncident({
      organizationId: screen.organizationId,
      branchId: screen.branchId,
      restroomId: screen.restroomId,
      screenId: screen.id,
      issueKey: (issueKey as IssueTypeKey) || null,
      rating: (rating as 1 | 2 | 3 | 4 | 5) || null,
      source,
    });

    // 7. Write activity log
    await createActivityLog({
      organizationId: screen.organizationId,
      actorUserId: null,
      incidentId: incident.id,
      action: "incident_created",
      metadata: {
        source,
        issueKey: issueKey || null,
        rating: rating || null,
      },
    });

    // 8. Trigger email notifications (non-blocking for client response)
    try {
      await sendIncidentAlert(incident);
    } catch (emailError) {
      console.error("Non-blocking error in sendIncidentAlert call:", emailError);
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating public incident:", error);
    return {
      success: false,
      error: "אירעה שגיאה בעיבוד הדיווח. אנא נסה שוב מאוחר יותר.",
    };
  }
}
