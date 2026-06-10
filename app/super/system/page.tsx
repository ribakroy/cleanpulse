import { Database, Mail, Terminal } from "lucide-react";
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

  // Check GitHub repo availability if adapter is github
  let githubRepoReachable: boolean | null = null;
  let githubError: string | null = null;

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
        githubRepoReachable = true;
      } else {
        githubRepoReachable = false;
        githubError = `GitHub API returned ${response.status}`;
      }
    } catch (error: unknown) {
      githubRepoReachable = false;
      githubError = error instanceof Error ? error.message : "Connection timed out";
    }
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">סטטוס מערכת</h1>
        <p className="text-sm text-slate-500 mt-1">
          פיקוח על מצב השרת, תקשורת בסיס הנתונים וריכוז מדדי נפח רשומות.
        </p>
      </div>

      {loadError && (
        <div className="rounded-[var(--radius-lg)] border border-danger/25 bg-danger/8 px-4 py-3.5 text-sm font-semibold text-danger">
          ⚠️ {loadError}
        </div>
      )}

      {/* Grid status cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Connection status */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="size-5 text-sky-500" />
              <CardTitle>חיבור נתונים ובסיס המידע</CardTitle>
            </div>
            <CardDescription>מצב הסנכרון והחיבור מול מקור המידע המרכזי.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
              <span className="text-slate-500">אדפטר נתונים:</span>
              <span className="font-semibold text-slate-900 font-mono capitalize">
                {env.dataAdapter === "github" ? "GitHub Repository (פרודקשן)" : "Local File Database (מקומי)"}
              </span>
            </div>

            {env.dataAdapter === "github" ? (
              <>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-500">רפוזיטורי יעד:</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {env.githubDataOwner}/{env.githubDataRepo} ({env.githubDataBranch})
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-slate-500">תקשורת גישה לגיטהאב:</span>
                  {githubRepoReachable ? (
                    <Badge variant="success">תקין ומקושר</Badge>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="danger">שגיאת חיבור</Badge>
                      {githubError && <span className="text-[10px] text-rose-600 font-mono">{githubError}</span>}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center py-2 text-sm">
                <span className="text-slate-500">נתיב שמירה מקומי:</span>
                <span className="font-semibold text-slate-900 font-mono">/data-local/data/</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Alerts status */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="size-5 text-sky-500" />
              <CardTitle>ספק התראות מייל</CardTitle>
            </div>
            <CardDescription>מצב השליחה ואינטגרציות של התראות המערכת.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
              <span className="text-slate-500">ספק נוכחי:</span>
              <span className="font-semibold text-slate-900 font-mono capitalize">
                {env.emailProvider === "resend" ? "Resend API" : "Mock Provider (מצב בדיקה)"}
              </span>
            </div>
            {env.emailProvider === "resend" ? (
              <>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-500">מפתח API:</span>
                  <span className="font-mono text-slate-950 font-semibold">
                    {env.resendApiKey ? "••••••••••••••••" : "לא מוגדר"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-slate-500">כתובת שליחה רשומה (From):</span>
                  <span className="font-semibold text-slate-900 font-mono">{env.emailFrom || "לא הוגדר"}</span>
                </div>
              </>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-[var(--radius-md)] p-3.5 text-xs text-slate-500 leading-relaxed">
                התראות המערכת נמצאות כרגע במצב <strong>Mock</strong> (בדיקה). המיילים לא נשלחים לנמענים אלא נרשמים בלוגים פנימיים בלבד.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Database Record Counts */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="size-5 text-slate-500" />
            <CardTitle>נפח נתונים ורשומות במאגר</CardTitle>
          </div>
          <CardDescription>סה&quot;כ רשומות רשומות לכל collection במאגר המידע.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y divide-slate-100 text-right">
            <div className="p-5 flex flex-col gap-1">
              <span className="text-xs text-slate-400">עסקים וארגונים</span>
              <span className="text-2xl font-bold text-slate-900">{counts.organizations}</span>
            </div>
            <div className="p-5 flex flex-col gap-1">
              <span className="text-xs text-slate-400">משתמשים רשומים</span>
              <span className="text-2xl font-bold text-slate-900">{counts.users}</span>
            </div>
            <div className="p-5 flex flex-col gap-1">
              <span className="text-xs text-slate-400">סניפים</span>
              <span className="text-2xl font-bold text-slate-900">{counts.branches}</span>
            </div>
            <div className="p-5 flex flex-col gap-1">
              <span className="text-xs text-slate-400">אזורי שירותים</span>
              <span className="text-2xl font-bold text-slate-900">{counts.restrooms}</span>
            </div>
            <div className="p-5 flex flex-col gap-1">
              <span className="text-xs text-slate-400">מסכים וקיאוסקים</span>
              <span className="text-2xl font-bold text-slate-900">{counts.screens}</span>
            </div>
            <div className="p-5 flex flex-col gap-1">
              <span className="text-xs text-slate-400">דיווחים ותקלות</span>
              <span className="text-2xl font-bold text-slate-900">{counts.incidents}</span>
            </div>
            <div className="p-5 flex flex-col gap-1">
              <span className="text-xs text-slate-400">נמעני התראות</span>
              <span className="text-2xl font-bold text-slate-900">{counts.notification_recipients}</span>
            </div>
            <div className="p-5 flex flex-col gap-1">
              <span className="text-xs text-slate-400">לוג שליחת התראות</span>
              <span className="text-2xl font-bold text-slate-900">{counts.notification_logs}</span>
            </div>
            <div className="p-5 flex flex-col gap-1">
              <span className="text-xs text-slate-400">לוגי פעילות כלליים</span>
              <span className="text-2xl font-bold text-slate-900">{counts.activity_logs}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
