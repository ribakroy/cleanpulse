import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NoAccessState } from "@/components/admin/no-access-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { canManageRecipients } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { listNotificationRecipientsByOrganization, createNotificationRecipient, deactivateNotificationRecipient } from "@/lib/data/repositories/notification-recipients";
import type { NotificationScopeType } from "@/types/domain";

export const metadata = { title: "נמענים" };

const recipientSchema = z.object({
  name: z.string().min(1, "שם חובה"),
  email: z.string().email("אימייל לא תקין"),
  scopeType: z.enum(["organization", "branch", "restroom", "screen"]),
  scopeId: z.string().optional(),
});

export default async function AdminRecipientsPage() {
  const user = await requireUser();
  if (!canManageRecipients(user)) return <NoAccessState description="למשתמש הנוכחי אין הרשאה לנהל נמענים." />;
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

    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Validation Error");

    // Basic scope matching validation (MVP implementation placeholder)
    let finalScopeId = parsed.data.scopeId;
    if (parsed.data.scopeType === "organization") finalScopeId = u.organizationId;
    else if (!finalScopeId) throw new Error("חובה להזין מזהה ישות עבור סניף/אזור שירותים/מסך");

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
      <PageHeader title="נמעני התראות" description="הגדרת מקבלי התראות בארגון לפי מיקומים" />
      <Card className="bg-brand-soft border-border">
        <CardHeader><CardTitle>הוסף נמען חדש</CardTitle></CardHeader>
        <CardContent>
          <form action={handleCreate} className="flex flex-col gap-3 max-w-sm">
            <input name="name" placeholder="שם מלא" required className="border p-2 rounded" />
            <input name="email" type="email" placeholder="אימייל" required className="border p-2 rounded" />
            <select name="scopeType" required className="border p-2 rounded">
              <option value="organization">ארגון שלם</option>
              <option value="branch">סניף ספציפי</option>
              <option value="restroom">אזור שירותים ספציפי</option>
              <option value="screen">מסך ספציפי</option>
            </select>
            <input name="scopeId" placeholder="מזהה ישות (השאר ריק עבור ארגון שלם)" className="border p-2 rounded" />
            <Button type="submit" className="bg-brand text-white">צור נמען</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {recipients.map(r => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle>{r.name} {!r.enabled && "(מושבת)"}</CardTitle>
              <CardDescription>{r.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Type: {r.scopeType}</p>
              <p className="text-sm font-mono truncate text-muted">ID: {r.scopeId}</p>
              {r.enabled && (
                <form action={handleDeactivate.bind(null, r.id)} className="mt-2">
                  <Button variant="danger" size="sm">השבת נמען</Button>
                </form>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
