"use server";

import { after } from "next/server";
import { z } from "zod";
import { findScreenByPublicToken, findScreenByQrToken } from "@/lib/data/repositories/screens";
import { getBranchById } from "@/lib/data/repositories/branches";
import { getRestroomById } from "@/lib/data/repositories/restrooms";
import { getIssueTypeByKey } from "@/lib/data/repositories/issue-types";
import { createVerifiedIncident } from "@/lib/data/repositories/incidents";
import { createActivityLog } from "@/lib/data/repositories/activity-logs";
import { sendIncidentAlert } from "@/lib/email/send-incident-alert";
import type { IncidentRecord } from "@/lib/data/types";
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
});

export type PublicIncidentInput = {
  token: string;
  source: "kiosk" | "qr";
  issueKey?: IssueTypeKey | null;
  rating?: (1 | 2 | 3 | 4 | 5) | null;
};

function scheduleIncidentSideEffects(input: {
  incident: IncidentRecord;
  source: "kiosk" | "qr";
  issueKey?: string | null | undefined;
  rating?: number | null | undefined;
}) {
  after(async () => {
    try {
      await createActivityLog({
        organizationId: input.incident.organizationId,
        actorUserId: null,
        incidentId: input.incident.id,
        action: "incident_created",
        metadata: {
          source: input.source,
          issueKey: input.issueKey || null,
          rating: input.rating || null,
        },
      });
    } catch (activityError) {
      console.error("Non-blocking error in createActivityLog:", activityError);
    }

    try {
      await sendIncidentAlert(input.incident);
    } catch (emailError) {
      console.error("Non-blocking error in sendIncidentAlert call:", emailError);
    }
  });
}

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

    // 4. Validate issueKey if provided. Rating may be attached to the same report.
    const issueType = issueKey ? await getIssueTypeByKey(issueKey as IssueTypeKey) : null;
    if (issueKey) {
      if (!issueType || !issueType.isActive) {
        return {
          success: false,
          error: "סוג התקלה שנבחר אינו פעיל או אינו קיים במערכת",
        };
      }
    }

    // 5. In-memory rate limiting check (server-side cooldown)
    const limitKey = issueKey && rating ? `combined_${issueKey}_${rating}` : issueKey ? `issue_${issueKey}` : null;
    if (limitKey && !checkRateLimit(token, limitKey)) {
      return {
        success: false,
        error: "דיווח דומה התקבל לאחרונה ממסך זה. אנא המתן מספר שניות.",
      };
    }

    // 6. Create incident in repository
    const incident = await createVerifiedIncident({
      organizationId: screen.organizationId,
      branchId: screen.branchId,
      restroomId: screen.restroomId,
      screenId: screen.id,
      issueKey: (issueKey as IssueTypeKey) || null,
      rating: (rating as 1 | 2 | 3 | 4 | 5) || null,
      source,
      verifiedIssueTypeId: issueType?.id ?? null,
      verifiedIssueSeverity: issueType?.severity ?? null,
    });

    // 7. Non-critical work runs after the response so public reporting stays fast.
    scheduleIncidentSideEffects({
      incident,
      source,
      issueKey,
      rating,
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating public incident:", error);
    return {
      success: false,
      error: "אירעה שגיאה בעיבוד הדיווח. אנא נסה שוב מאוחר יותר.",
    };
  }
}
