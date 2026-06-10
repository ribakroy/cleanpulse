import { ScrollText, Clock, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDataAdapter } from "@/lib/data/get-data-adapter";
import type { ActivityLogRecord } from "@/lib/data/types";

export const revalidate = 0; // Dynamic

function formatActionLabel(action: string) {
  switch (action) {
    case "organization_created":
      return "הקמת עסק חדש";
    case "organization_status_changed":
      return "עדכון סטטוס עסק";
    case "organization_details_updated":
      return "עריכת פרטי עסק";
    case "user_password_reset_by_super":
      return "איפוס סיסמת משתמש ע״י מנהל על";
    case "user_created_by_super":
      return "הוספת משתמש ע״י מנהל על";
    case "incident_seeded":
      return "אתחול נתוני דמו";
    default:
      return action;
  }
}

export default async function SuperActivityPage() {
  const adapter = getDataAdapter();

  let activityLogs: ActivityLogRecord[] = [];
  let errorMsg: string | null = null;

  try {
    activityLogs = await adapter.list("activity_logs", { includeInactive: true }) as ActivityLogRecord[];
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "שגיאה בטעינת היסטוריית הפעילות.";
  }

  // Sort logs: newest first
  const sortedLogs = [...activityLogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">יומן פעילות</h1>
        <p className="text-sm text-muted mt-1">
          תיעוד מלא וכרונולוגיו של כל פעולות הניהול, שינויי הסטטוס ועדכוני המערכת.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-[var(--radius-lg)] border border-danger/25 bg-danger/8 px-4 py-3.5 text-sm font-semibold text-danger">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Activity Timeline */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ScrollText className="size-5 text-muted" />
            <CardTitle>היסטוריית שינויים</CardTitle>
          </div>
          <CardDescription>לוג אירועים פנימיים מוקלטים של הפלטפורמה.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {sortedLogs.length === 0 ? (
            <div className="text-center py-10 text-muted">
              אין פעילות רשומה ביומן כעת.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sortedLogs.map((log) => {
                const formattedTime = new Date(log.createdAt).toLocaleString("he-IL", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  timeZone: "Asia/Jerusalem",
                });

                return (
                  <div key={log.id} className="p-5 flex items-start gap-4 hover:bg-brand-soft/30 transition-colors">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand mt-0.5">
                      <Clock className="size-4.5" />
                    </span>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground text-sm">
                          {formatActionLabel(log.action)}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {log.action}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted leading-normal space-y-1">
                        <div className="flex items-center gap-1.5">
                          <User className="size-3 text-muted" />
                          <span>מבצע הפעולה: {log.actorUserId || "מערכת (פנימי)"}</span>
                        </div>
                        {log.organizationId !== "system" && (
                          <div>מזהה ארגון: <span className="font-mono">{log.organizationId}</span></div>
                        )}
                      </div>

                      {/* Display metadata if it has relevant info */}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="bg-brand-soft/30 border border-border rounded p-3 text-xs font-mono text-muted overflow-x-auto mt-2 max-w-full">
                          <pre className="whitespace-pre-wrap leading-relaxed">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted whitespace-nowrap mt-1">
                      {formattedTime}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
