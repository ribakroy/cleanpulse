import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NoAccessState } from "@/components/admin/no-access-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { canViewScreens, canManageSettings } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { listScreensByOrganization, createScreen, deactivateScreen, regenerateScreenTokens } from "@/lib/data/repositories/screens";
import { listRestroomsByOrganization } from "@/lib/data/repositories/restrooms";
import { QrCard } from "./qr-card";

export const metadata = { title: "מסכים" };

const screenSchema = z.object({
  restroomId: z.string().min(1, "יש לבחור אזור שירותים"),
  name: z.string().min(1, "שם המסך הוא חובה"),
});

export default async function AdminScreensPage() {
  const user = await requireUser();
  if (!canViewScreens(user)) return <NoAccessState description="למשתמש הנוכחי אין הרשאה." />;
  const canEdit = canManageSettings(user);
  const screens = await listScreensByOrganization(user.organizationId);
  const restrooms = await listRestroomsByOrganization(user.organizationId);

  // App URL for QR generation
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  async function handleCreate(formData: FormData) {
    "use server";
    const u = await requireUser();
    if (!canManageSettings(u)) throw new Error("Unauthorized");
    
    const parsed = screenSchema.safeParse({
      restroomId: formData.get("restroomId"),
      name: formData.get("name"),
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Validation Error");

    const validRestrooms = await listRestroomsByOrganization(u.organizationId);
    const restroom = validRestrooms.find(r => r.id === parsed.data.restroomId);
    if (!restroom) throw new Error("אזור שירותים אינו קיים בארגון זה");
    
    await createScreen(u.organizationId, {
      name: parsed.data.name,
      restroomId: restroom.id,
      branchId: restroom.branchId,
      isActive: true,
    });
    revalidatePath("/admin/screens");
  }

  async function handleDeactivate(id: string) {
    "use server";
    const u = await requireUser();
    if (!canManageSettings(u)) throw new Error("Unauthorized");
    await deactivateScreen(u.organizationId, id);
    revalidatePath("/admin/screens");
  }

  async function handleRegenerate(id: string) {
    "use server";
    const u = await requireUser();
    if (!canManageSettings(u)) throw new Error("Unauthorized");
    await regenerateScreenTokens(u.organizationId, id);
    revalidatePath("/admin/screens");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="מסכים וקישורים" description="ניהול מסכי Kiosk וקישורי QR" />
      {canEdit && (
        <Card className="bg-brand-soft border-border">
          <CardHeader><CardTitle>צור מסך חדש</CardTitle></CardHeader>
          <CardContent>
            <form action={handleCreate} className="flex flex-col gap-3 max-w-sm">
              <select name="restroomId" required className="border p-2 rounded">
                <option value="">בחר אזור שירותים</option>
                {restrooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <input name="name" placeholder="שם המסך" required className="border p-2 rounded" />
              <Button type="submit" className="bg-brand text-white">צור מסך</Button>
            </form>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 xl:grid-cols-2">
        {screens.map(s => {
          const qrUrl = `${baseUrl}/q/${s.qrToken}`;
          const kioskUrl = `${baseUrl}/k/${s.publicToken}`;
          return (
            <Card key={s.id}>
              <CardHeader>
                <CardTitle>{s.name} {!s.isActive && "(לא פעיל)"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <QrCard qrUrl={qrUrl} kioskUrl={kioskUrl} publicToken={s.publicToken} qrToken={s.qrToken} />
                
                {canEdit && s.isActive && (
                  <div className="flex gap-2 mt-4">
                    <form action={handleDeactivate.bind(null, s.id)}><Button variant="danger" size="sm">השבת מסך</Button></form>
                    <form action={handleRegenerate.bind(null, s.id)}>
                      <Button variant="secondary" size="sm" onClick={(e) => { if(!confirm("האם אתה בטוח שברצונך לאפס את הקישורים? הקישורים הישנים יפסיקו לעבוד.")) e.preventDefault(); }}>
                        Regenerate Tokens
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
