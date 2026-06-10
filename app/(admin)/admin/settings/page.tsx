import { NoAccessState } from "@/components/admin/no-access-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { canManageSettings, canViewSettings, formatRoleLabel } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { getOrganizationById } from "@/lib/data/repositories/organizations";
import { listUsersByOrganization } from "@/lib/data/repositories/users";

export const metadata = {
  title: "הגדרות",
};

const planLabels: Record<string, string> = {
  free: "חינמי",
  starter: "מתחיל",
  pro: "מקצועי",
  enterprise: "ארגוני",
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

  const activeUsersCount = users.filter((u) => u.isActive).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="הגדרות"
        description="פרטי ארגון, אבטחה ומשתמשים פעילים."
        actions={
          <Badge variant={canManageSettings(user) ? "secondary" : "outline"}>
            {canManageSettings(user) ? "הרשאת ניהול" : "צפייה בלבד"}
          </Badge>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        {/* Org details */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי ארגון</CardTitle>
            <CardDescription>פרטי החשבון הארגוני במערכת CleanPulse.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-muted">שם הארגון</span>
              <span className="font-semibold text-foreground">{organization?.name ?? "לא זמין"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-muted">כתובת ייחודית</span>
              <span className="font-mono text-xs bg-brand-soft border border-border rounded-lg px-2 py-1 text-brand-deep">
                {organization?.slug ?? "לא זמין"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">תוכנית</span>
              <Badge variant="secondary">
                {planLabels[organization?.plan ?? ""] ?? organization?.plan ?? "לא זמין"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>אבטחה ופרטיות</CardTitle>
            <CardDescription>מידע על הגנת הגישה לחשבון.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-muted">אימות משתמשים</span>
              <span className="font-semibold text-foreground">קוקי מאובטח</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-muted">תוקף התחברות</span>
              <span className="font-semibold text-foreground">7 ימים</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">משתמשים פעילים</span>
              <Badge variant="secondary">{activeUsersCount}</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>משתמשים בארגון</CardTitle>
          <CardDescription>
            כל המשתמשים המורשים לגשת למערכת הניהול.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-foreground">{u.fullName}</p>
                <p className="text-sm text-muted">{u.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{formatRoleLabel(u.role)}</Badge>
                <Badge variant={u.isActive ? "success" : "neutral"}>
                  {u.isActive ? "פעיל" : "לא פעיל"}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
