import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NoAccessState } from "@/components/admin/no-access-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { canViewLocations, canManageSettings } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { listRestroomsByOrganization, createRestroom, deactivateRestroom } from "@/lib/data/repositories/restrooms";
import { listBranchesByOrganization } from "@/lib/data/repositories/branches";

export const metadata = { title: "אזורי שירותים" };

const restroomSchema = z.object({
  branchId: z.string().min(1, "יש לבחור סניף"),
  name: z.string().min(1, "שם האזור הוא חובה"),
  floor: z.string().optional(),
  areaDescription: z.string().optional(),
});

export default async function AdminRestroomsPage() {
  const user = await requireUser();
  if (!canViewLocations(user)) return <NoAccessState description="למשתמש הנוכחי אין הרשאה." />;
  const canEdit = canManageSettings(user);
  const restrooms = await listRestroomsByOrganization(user.organizationId);
  const branches = await listBranchesByOrganization(user.organizationId);

  async function handleCreate(formData: FormData) {
    "use server";
    const u = await requireUser();
    if (!canManageSettings(u)) throw new Error("Unauthorized");
    
    const parsed = restroomSchema.safeParse({
      branchId: formData.get("branchId"),
      name: formData.get("name"),
      floor: formData.get("floor"),
      areaDescription: formData.get("area"),
    });

    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Validation Error");

    // Validate branch ownership
    const validBranches = await listBranchesByOrganization(u.organizationId);
    if (!validBranches.some(b => b.id === parsed.data.branchId)) {
      throw new Error("הסניף אינו קיים בארגון זה");
    }

    await createRestroom(u.organizationId, {
      branchId: parsed.data.branchId,
      name: parsed.data.name,
      floor: parsed.data.floor || "",
      areaDescription: parsed.data.areaDescription || "",
      isActive: true,
    });
    revalidatePath("/admin/restrooms");
  }

  async function handleDeactivate(id: string) {
    "use server";
    const u = await requireUser();
    if (!canManageSettings(u)) throw new Error("Unauthorized");
    await deactivateRestroom(u.organizationId, id);
    revalidatePath("/admin/restrooms");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="אזורי שירותים" description="ניהול אזורי שירותים בארגון" />
      {canEdit && (
        <Card className="bg-brand-soft border-border">
          <CardHeader><CardTitle>צור אזור חדש</CardTitle></CardHeader>
          <CardContent>
            <form action={handleCreate} className="flex flex-col gap-3 max-w-sm">
              <select name="branchId" required className="border p-2 rounded">
                <option value="">בחר סניף</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <input name="name" placeholder="שם האזור" required className="border p-2 rounded" />
              <input name="floor" placeholder="קומה (אופציונלי)" className="border p-2 rounded" />
              <input name="area" placeholder="תיאור האזור (אופציונלי)" className="border p-2 rounded" />
              <Button type="submit" className="bg-brand text-white">צור אזור שירותים</Button>
            </form>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {restrooms.map(r => {
          const branch = branches.find(b => b.id === r.branchId);
          return (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle>{r.name} {!r.isActive && "(לא פעיל)"}</CardTitle>
                <CardDescription>קומה: {r.floor} | אזור: {r.areaDescription} | סניף: {branch?.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {canEdit && r.isActive && (
                  <form action={handleDeactivate.bind(null, r.id)}>
                    <Button variant="danger" size="sm">השבת</Button>
                  </form>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
