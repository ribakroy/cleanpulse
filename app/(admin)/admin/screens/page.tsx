import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NoAccessState } from "@/components/admin/no-access-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { canViewScreens, canManageSettings, filterRestroomsForUser, filterScreensForUser } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import {
  listScreensByOrganization,
  createScreen,
  deactivateScreen,
  regenerateScreenTokens,
} from "@/lib/data/repositories/screens";
import { listRestroomsByOrganization } from "@/lib/data/repositories/restrooms";
import { QrCard } from "./qr-card";
import { TabletSmartphone } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "מסכים וקישורים | CleanPulse" };

const screenSchema = z.object({
  restroomId: z.string().min(1, "יש לבחור אזור שירותים"),
  name: z.string().min(1, "שם המסך הוא חובה"),
});

export default async function AdminScreensPage() {
  const user = await requireUser();
  if (!canViewScreens(user))
    return <NoAccessState description="למשתמש הנוכחי אין הרשאה." />;
  const canEdit = canManageSettings(user);
  const [allScreens, allRestrooms] = await Promise.all([
    listScreensByOrganization(user.organizationId),
    listRestroomsByOrganization(user.organizationId),
  ]);
  const screens = filterScreensForUser(user, allScreens);
  const restrooms = filterRestroomsForUser(user, allRestrooms);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  async function handleCreate(formData: FormData) {
    "use server";
    const u = await requireUser();
    if (!canManageSettings(u)) throw new Error("Unauthorized");

    const parsed = screenSchema.safeParse({
      restroomId: formData.get("restroomId"),
      name: formData.get("name"),
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "שגיאת אימות");

    const validRestrooms = await listRestroomsByOrganization(u.organizationId);
    const restroom = validRestrooms.find((r) => r.id === parsed.data.restroomId);
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
      <PageHeader
        title="מסכים וקישורים"
        description={`${screens.length} מסך${screens.length === 1 ? "" : "ים"} מוגדר${screens.length === 1 ? "" : "ים"}`}
      />

      {canEdit && (
        <Card className="border-brand-water/20 bg-brand-soft/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TabletSmartphone className="size-4 text-brand" aria-hidden="true" />
              הוספת מסך חדש
            </CardTitle>
            <CardDescription>
              כל מסך מקבל קישור לטאבלט וקישור לסריקה בנייד.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleCreate} className="grid gap-4 sm:grid-cols-2 items-end max-w-xl">
              <div className="sm:col-span-2">
                <Select name="restroomId" label="אזור שירותים" required>
                  <option value="">בחר אזור שירותים...</option>
                  {restrooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </div>
              <Input
                name="name"
                label="שם המסך"
                placeholder='לדוגמה: כניסה ראשית'
                required
              />
              <div className="flex items-end">
                <Button type="submit" variant="primary" size="md" fullWidth>
                  צור מסך
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {screens.length === 0 ? (
        <EmptyState
          title="אין מסכים מוגדרים"
          description="צור מסך חדש כדי לקבל קישורי דיווח לאזור שירותים."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {screens.map((s) => {
            const qrUrl = `${baseUrl}/q/${s.qrToken}`;
            const kioskUrl = `${baseUrl}/k/${s.publicToken}`;
            return (
              <Card key={s.id} className={!s.isActive ? "opacity-60" : undefined}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                        <TabletSmartphone className="size-4" aria-hidden="true" />
                      </span>
                      <CardTitle className="text-base truncate">
                        {s.name}
                      </CardTitle>
                    </div>
                    <Badge variant={s.isActive ? "secondary" : "outline"} className="shrink-0">
                      {s.isActive ? "פעיל" : "לא פעיל"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <QrCard
                    qrUrl={qrUrl}
                    kioskUrl={kioskUrl}
                    publicToken={s.publicToken}
                    qrToken={s.qrToken}
                    canEdit={canEdit}
                    isActive={s.isActive}
                    onDeactivate={handleDeactivate.bind(null, s.id)}
                    onRegenerate={handleRegenerate.bind(null, s.id)}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
