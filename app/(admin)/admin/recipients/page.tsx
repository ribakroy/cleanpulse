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
  scopeType: z.enum(["organization", "branch", "restroom", "screen"]),
  scopeId: z.string().optional(),
});

export default async function AdminRecipientsPage() {
  const user = await requireUser();
  if (!canManageRecipients(user))
    return <NoAccessState description="למשתמש הנוכחי אין הרשאה לנהל נמענים." />;
  const recipients = await listNotificationRecipientsByOrganization(user.organizationId);

  async function handleCreate(formData: FormData) {
    "use server";
    const u = await requireUser();
    if (!canManageRecipients(u)) throw new Error("Unauthorized");

    const parsed = recipientSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      scopeType: formData.get("scopeType"),
      scopeId: formData.get("scopeId"),
    });

    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "שגיאת אימות");

    let finalScopeId = parsed.data.scopeId;
    if (parsed.data.scopeType === "organization") finalScopeId = u.organizationId;
    else if (!finalScopeId)
      throw new Error("חובה להזין מזהה ישות עבור סניף / אזור שירותים / מסך");

    await createNotificationRecipient(u.organizationId, {
      name: parsed.data.name,
      email: parsed.data.email,
      scopeType: parsed.data.scopeType as NotificationScopeType,
      scopeId: finalScopeId,
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
        description="הגדרת מקבלי התראות מייל לפי סניף, אזור שירותים או מסך"
      />

      {/* Create form */}
      <Card className="border-brand-water/20 bg-brand-soft/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="size-4 text-brand" aria-hidden="true" />
            הוספת נמען חדש
          </CardTitle>
          <CardDescription>
            נמען מקבל התראה בכל פעם שנרשם דיווח בטווח שלו.
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
            <Select name="scopeType" label="סוג כיסוי" required>
              <option value="organization">ארגון שלם</option>
              <option value="branch">סניף ספציפי</option>
              <option value="restroom">אזור שירותים ספציפי</option>
              <option value="screen">מסך ספציפי</option>
            </Select>
            <Input
              name="scopeId"
              label="מזהה ישות"
              placeholder="השאר ריק עבור ארגון שלם"
              hint="מזהה סניף, אזור שירותים, או מסך — לפי הבחירה למעלה"
            />
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
                {r.scopeType !== "organization" && (
                  <p className="text-[11px] text-muted font-mono truncate">
                    מזהה שיוך: {r.scopeId?.substring(0, 8)}
                  </p>
                )}
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
