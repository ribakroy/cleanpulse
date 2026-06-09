import { type NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { listIncidentsByOrganization } from "@/lib/data/repositories/incidents";
import { listBranchesByOrganization } from "@/lib/data/repositories/branches";
import { listRestroomsByOrganization } from "@/lib/data/repositories/restrooms";
import { listScreensByOrganization } from "@/lib/data/repositories/screens";
import { listIssueTypes } from "@/lib/data/repositories/issue-types";
import { getDataAdapter } from "@/lib/data/get-data-adapter";
import { filterIncidents } from "@/lib/reports/metrics";
import { generateIncidentsCsv } from "@/lib/reports/csv";
import type { NotificationLogRecord } from "@/lib/data/types";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user (scoping automatically starts here)
    const user = await requireUser();

    // 2. Extract filter parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const branchId = searchParams.get("branchId");
    const restroomId = searchParams.get("restroomId");
    const screenId = searchParams.get("screenId");
    const issueKey = searchParams.get("issueKey");
    const status = searchParams.get("status");

    // 3. Fetch data in parallel (scoped to user organization)
    const [incidents, branches, restrooms, screens, issueTypes, notificationLogs] = await Promise.all([
      listIncidentsByOrganization(user.organizationId),
      listBranchesByOrganization(user.organizationId),
      listRestroomsByOrganization(user.organizationId),
      listScreensByOrganization(user.organizationId),
      listIssueTypes(),
      getDataAdapter().query("notification_logs", { organizationId: user.organizationId }),
    ]);

    // 4. Apply filtering
    const filteredIncidents = filterIncidents(incidents, {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      branchId: branchId || undefined,
      restroomId: restroomId || undefined,
      screenId: screenId || undefined,
      issueKey: issueKey || undefined,
      status: status || undefined,
    });

    // 5. Generate CSV
    const csvString = generateIncidentsCsv(
      filteredIncidents,
      branches,
      restrooms,
      screens,
      issueTypes,
      notificationLogs as NotificationLogRecord[]
    );

    // 6. Return response
    return new Response(csvString, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=incidents_report.csv",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal Server Error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
