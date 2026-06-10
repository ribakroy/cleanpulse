import { Database, Mail, Terminal, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { env } from "@/lib/utils/env";
import { getDataAdapter } from "@/lib/data/get-data-adapter";
import type { ScreenRecord, BranchRecord, IncidentRecord, UserRecord, OrganizationRecord, RestroomRecord, NotificationRecipientRecord, NotificationLogRecord, ActivityLogRecord } from "@/lib/data/types";

export const revalidate = 0; // Dynamic

export default async function SuperSystemPage() {
  const adapter = getDataAdapter();

  // Load counts from all collections safely
  let counts = {
    organizations: 0,
    users: 0,
    branches: 0,
    restrooms: 0,
    screens: 0,
    incidents: 0,
    notification_recipients: 0,
    notification_logs: 0,
    activity_logs: 0,
  };

  let loadError: string | null = null;

  try {
    const [
      orgs,
      users,
      branches,
      restrooms,
      screens,
      incidents,
      recipients,
      notificationLogs,
      activityLogs,
    ] = await Promise.all([
      adapter.list("organizations", { includeInactive: true }) as Promise<OrganizationRecord[]>,
      adapter.list("users", { includeInactive: true }) as Promise<UserRecord[]>,
      adapter.list("branches", { includeInactive: true }) as Promise<BranchRecord[]>,
      adapter.list("restrooms", { includeInactive: true }) as Promise<RestroomRecord[]>,
      adapter.list("screens", { includeInactive: true }) as Promise<ScreenRecord[]>,
      adapter.list("incidents", { includeInactive: true }) as Promise<IncidentRecord[]>,
      adapter.list("notification_recipients", { includeInactive: true }) as Promise<NotificationRecipientRecord[]>,
      adapter.list("notification_logs", { includeInactive: true }) as Promise<NotificationLogRecord[]>,
      adapter.list("activity_logs", { includeInactive: true }) as Promise<ActivityLogRecord[]>,
    ]);

    counts = {
      organizations: orgs.length,
      users: users.length,
      branches: branches.length,
      restrooms: restrooms.length,
      screens: screens.length,
      incidents: incidents.length,
      notification_recipients: recipients.length,
      notification_logs: notificationLogs.length,
      activity_logs: activityLogs.length,
    };
  } catch (err: unknown) {
    loadError = err instanceof Error ? err.message : "שגיאה בטעינת נתוני המערכת.";
  }

  // Check data connection health
  let dataConnectionOk: boolean | null = null;
  let dataConnectionNote: string | null = null;

  if (env.dataAdapter === "github") {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const url = `https://api.github.com/repos/${env.githubDataOwner}/${env.githubDataRepo}`;
      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${env.githubDataToken}`,
          "User-Agent": "CleanPulse-Owner-Console",
        },
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        dataConnectionOk = true;
      } else {
        dataConnectionOk = false;
        dataConnectionNote = `שגיאת תקשורת (${response.status})`;
      }
    } catch (error: unknown) {
      dataConnectionOk = false;
      dataConnectionNote = error instanceof Error ? error.message : "פסק זמן בחיבור";
    }
  } else {
    // Local file adapter — always considered reachable
    dataConnectionOk = true;
  }

  const isEmailLive = env.emailProvider === "resend";

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">סטטוס מערכת</h1>
        <p className="text-sm text-muted mt-1">
          חיבורים מרכזיים ותיעוד פעילות.
        </p>
      </div>

      {loadError && (
        <div className="rounded-[var(--radius-lg)] border border-danger/25 bg-danger/8 px-4 py-3.5 text-sm font-semibold text-danger">
          ⚠️ {loadError}
        </div>
      )}

      {/* Status Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Data Connection */}
        <Card className="border shadow-soft">
          <CardHeader className="border-b border-border bg-brand-soft/40">
            <div className="flex items-center gap-2">
              <Database className="size-5 text-brand" />
              <CardTitle className="text-base font-bold">חיבור נתונים</CardTitle>
            </div>
            <CardDescription>מצב הסנכרון מול מקור המידע.</CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border text-sm">
              <span className="text-muted">סוג חיבור</span>
              <span className="font-semibold text-foreground">
                {env.dataAdapter === "github" ? "חיבור ענן" : "חיבור מקומי"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 text-sm">
              <span className="text-muted">תקינות חיבור</span>
              {dataConnectionOk === true ? (
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle className="size-4 text-emerald-600" />
                  תקין
                </div>
              ) : dataConnectionOk === false ? (
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5 text-danger font-semibold">
                    <XCircle className="size-4" />
                    שגיאת חיבור
                  </div>
                  {dataConnectionNote && (
                    <span className="text-[11px] text-danger/70">{dataConnectionNote}</span>
                  )}
                </div>
              ) : (
                <Badge variant="outline">לא נבדק</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Email Alerts */}
        <Card className="border shadow-soft">
          <CardHeader className="border-b border-border bg-brand-soft/40">
            <div className="flex items-center gap-2">
              <Mail className="size-5 text-brand" />
              <CardTitle className="text-base font-bold">שירות התראות מייל</CardTitle>
            </div>
            <CardDescription>מצב שליחת התראות לנמענים.</CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border text-sm">
              <span className="text-muted">מצב שירות</span>
              {isEmailLive ? (
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle className="size-4 text-emerald-600" />
                  פעיל — מיילים נשלחים
                </div>
              ) : (
                <Badge variant="warning">
                  מצב בדיקה — לא נשלח
                </Badge>
              )}
            </div>
            {isEmailLive && (
              <div className="flex justify-between items-center py-2 text-sm">
                <span className="text-muted">כתובת שליחה</span>
                <span className="font-semibold text-foreground font-mono text-xs">
                  {env.emailFrom || "לא הוגדר"}
                </span>
              </div>
            )}
            {!isEmailLive && (
              <p className="text-xs text-muted leading-relaxed pt-1">
                התראות נשמרות לבדיקה בלבד. שליחה אמיתית אינה פעילה כרגע.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Record Counts */}
      <Card className="border shadow-soft">
        <CardHeader className="border-b border-border bg-brand-soft/40">
          <div className="flex items-center gap-2">
            <Terminal className="size-5 text-muted" />
            <CardTitle className="text-base font-bold">תיעוד ונתונים</CardTitle>
          </div>
          <CardDescription>סה&quot;כ רשומות לכל קטגוריה במאגר.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 md:grid-cols-3 divide-y divide-border text-right">
            {[
              { label: "עסקים", value: counts.organizations },
              { label: "משתמשים", value: counts.users },
              { label: "סניפים", value: counts.branches },
              { label: "אזורי שירותים", value: counts.restrooms },
              { label: "מסכים", value: counts.screens },
              { label: "דיווחים", value: counts.incidents },
              { label: "נמעני התראות", value: counts.notification_recipients },
              { label: "תיעוד התראות", value: counts.notification_logs },
              { label: "תיעוד פעילות", value: counts.activity_logs },
            ].map(({ label, value }) => (
              <div key={label} className="p-5 flex flex-col gap-1">
                <span className="text-xs text-muted">{label}</span>
                <span className="text-2xl font-bold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
