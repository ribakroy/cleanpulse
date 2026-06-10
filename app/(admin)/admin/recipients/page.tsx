import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NoAccessState } from "@/components/admin/no-access-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { canManageRecipients } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import {
  listNotificationRecipientsByOrganization,
  createNotificationRecipient,
  deactivateNotificationRecipient,
} from "@/lib/data/repositories/notification-recipients";
import { listBranchesByOrganization } from "@/lib/data/repositories/branches";
import { listRestroomsByOrganization } from "@/lib/data/repositories/restrooms";
import { listScreensByOrganization } from "@/lib/data/repositories/screens";
import type { NotificationScopeType } from "@/types/domain";
import { Mail } from "lucide-react";

export const metadata = { title: "נמעני התראות | CleanPulse" };

const SCOPE_LABELS: Record<string, string> = {
  organization: "ארגון שלם",
  branch: "סניף ספציפי",
  restroom: "אזור שירותים ספציפי",
  screen: "מסך ספציפי",
};

const recipientSchema = z.object({
  name: z.string().min(1, "שם חובה"),
  email: z.string().email("אימייל לא תקין"),
  scope: z.string().min(1, "יש לבחור יעד התראה"),
});

export default async function AdminRecipientsPage() {
  const user = await requireUser();
  if (!canManageRecipients(user))
    return <NoAccessState description="למשתמש הנוכחי אין הרשאה לנהל נמענים." />;
  const [recipients, branches, restrooms, screens] = await Promise.all([
    listNotificationRecipientsByOrganization(user.organizationId),
    listBranchesByOrganization(user.organizationId),
    listRestroomsByOrganization(user.organizationId),
    listScreensByOrganization(user.organizationId),
  ]);

  async function handleCreate(formData: FormData) {
    "use server";
    const u = await requireUser();
    if (!canManageRecipients(u)) throw new Error("Unauthorized");

    const parsed = recipientSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      scope: formData.get("scope"),
    });

    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "שגיאת אימות");

    const [scopeType, scopeId] = parsed.data.scope.split(":") as [NotificationScopeType, string | undefined];
    if (!scopeId || !["organization", "branch", "restroom", "screen"].includes(scopeType)) {
      throw new Error("יש לבחור יעד התראה תקין");
    }

    await createNotificationRecipient(u.organizationId, {
      name: parsed.data.name,
      email: parsed.data.email,
      scopeType,
      scopeId,
      enabled: true,
    });
    revalidatePath("/admin/recipients");
  }

  async function handleDeactivate(id: string) {
    "use server";
    const u = await requireUser();
    if (!canManageRecipients(u)) throw new Error("Unauthorized");
    await deactivateNotificationRecipient(u.organizationId, id);
    revalidatePath("/admin/recipients");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="נמעני התראות"
        description="מי מקבל התראה ועל איזה אזור."
      />

      {/* Create form */}
      <Card className="border-brand-water/20 bg-brand-soft/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="size-4 text-brand" aria-hidden="true" />
            הוספת נמען חדש
          </CardTitle>
          <CardDescription>
            נמען מקבל התראה כשהדיווח שייך ליעד שבחרת.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleCreate} className="grid gap-4 sm:grid-cols-2 items-end max-w-2xl">
            <Input name="name" label="שם מלא" placeholder="ישראל ישראלי" required />
            <Input
              name="email"
              label="כתובת מייל"
              type="email"
              placeholder="israel@example.com"
              required
            />
            <Select name="scope" label="יעד התראה" required>
              <option value={`organization:${user.organizationId}`}>כל העסק</option>
              {branches.map((branch) => (
                <option key={branch.id} value={`branch:${branch.id}`}>
                  סניף: {branch.name}
                </option>
              ))}
              {restrooms.map((restroom) => (
                <option key={restroom.id} value={`restroom:${restroom.id}`}>
                  אזור שירותים: {restroom.name}
                </option>
              ))}
              {screens.map((screen) => (
                <option key={screen.id} value={`screen:${screen.id}`}>
                  מסך: {screen.name}
                </option>
              ))}
            </Select>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" variant="primary" size="md">
                הוסף נמען
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recipients list */}
      {recipients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted text-sm">
            <Mail className="mx-auto mb-3 size-10 text-border" aria-hidden="true" />
            <p className="font-medium text-foreground">אין נמענים מוגדרים</p>
            <p className="mt-1">הוסף נמען חדש כדי שהתראות יישלחו בעת דיווח.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {recipients.map((r) => (
            <Card key={r.id} className={!r.enabled ? "opacity-60" : undefined}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      <Mail className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">
                        {r.name} {!r.enabled && "(מושבת)"}
                      </CardTitle>
                      <p className="mt-0.5 text-xs text-muted truncate">{r.email}</p>
                    </div>
                  </div>
                  <Badge variant={r.enabled ? "secondary" : "outline"} className="shrink-0">
                    {SCOPE_LABELS[r.scopeType] ?? r.scopeType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <p className="text-[11px] text-muted">
                  {r.enabled ? "מקבל התראות פעילות" : "התראות מושבתות"}
                </p>
                {r.enabled && (
                  <form action={handleDeactivate.bind(null, r.id)}>
                    <Button variant="danger" size="sm">
                      השבת נמען
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
