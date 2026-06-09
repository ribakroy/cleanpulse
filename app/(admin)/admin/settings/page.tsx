import { NoAccessState } from "@/components/admin/no-access-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { canManageSettings, canViewSettings, formatRoleLabel } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { getOrganizationById } from "@/lib/data/repositories/organizations";
import { listUsersByOrganization } from "@/lib/data/repositories/users";
import { env } from "@/lib/utils/env";

export const metadata = {
  title: "הגדרות",
};

export default async function AdminSettingsPage() {
  const user = await requireUser();

  if (!canViewSettings(user)) {
    return <NoAccessState description="למשתמש הנוכחי אין הרשאה לצפות בהגדרות הארגון." />;
  }

  const [organization, users] = await Promise.all([
    getOrganizationById(user.organizationId),
    listUsersByOrganization(user.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="הגדרות"
        description="מסך קריאה מאובטח להגדרות מערכת ופרטי ארגון. owner/admin מקבלים גם הרשאת ניהול עתידית."
        actions={
          <Badge variant={canManageSettings(user) ? "secondary" : "outline"}>
            {canManageSettings(user) ? "הרשאת ניהול" : "צפייה בלבד"}
          </Badge>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>פרטי ארגון</CardTitle>
            <CardDescription>הנתונים נטענים ישירות מה־repository של organizations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-7 text-muted">
            <p>שם: {organization?.name ?? "לא זמין"}</p>
            <p>Slug: {organization?.slug ?? "לא זמין"}</p>
            <p>Plan: {organization?.plan ?? "לא זמין"}</p>
            <p>Data adapter: {env.dataAdapter}</p>
            <p>Email provider: {env.emailProvider}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>אבטחה והרשאות</CardTitle>
            <CardDescription>אין registration פתוח. משתמשים מתווספים ידנית בשכבת הדאטה.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-7 text-muted">
            <p>Session: JWT cookie חתום עם AUTH_SECRET.</p>
            <p>Cookie: httpOnly, sameSite=lax, secure בפרודקשן.</p>
            <p>משתמשים פעילים: {users.filter((candidate) => candidate.isActive).length}</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>משתמשים בארגון</CardTitle>
          <CardDescription>passwordHash לא נחשף בשום response ללקוח.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map((candidate) => (
            <div
              key={candidate.id}
              className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-foreground">{candidate.fullName}</p>
                <p className="text-sm text-muted">{candidate.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{formatRoleLabel(candidate.role)}</Badge>
                <Badge variant={candidate.isActive ? "success" : "neutral"}>
                  {candidate.isActive ? "פעיל" : "לא פעיל"}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
