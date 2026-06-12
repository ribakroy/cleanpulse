import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NoAccessState } from "@/components/admin/no-access-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { canViewLocations, canManageSettings, filterBranchesForUser, filterRestroomsForUser } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import {
  listRestroomsByOrganization,
  createRestroom,
  deactivateRestroom,
} from "@/lib/data/repositories/restrooms";
import { listBranchesByOrganization } from "@/lib/data/repositories/branches";
import { DoorOpen, Building2 } from "lucide-react";

export const metadata = { title: "אזורי שירותים | CleanPulse" };

const restroomSchema = z.object({
  branchId: z.string().min(1, "יש לבחור סניף"),
  name: z.string().min(1, "שם האזור הוא חובה"),
  floor: z.string().optional(),
  areaDescription: z.string().optional(),
});

export default async function AdminRestroomsPage() {
  const user = await requireUser();
  if (!canViewLocations(user))
    return <NoAccessState description="למשתמש הנוכחי אין הרשאה." />;
  const canEdit = canManageSettings(user);
  const [allRestrooms, allBranches] = await Promise.all([
    listRestroomsByOrganization(user.organizationId),
    listBranchesByOrganization(user.organizationId),
  ]);
  const restrooms = filterRestroomsForUser(user, allRestrooms);
  const branches = filterBranchesForUser(user, allBranches, allRestrooms);

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

    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "שגיאת אימות");

    const validBranches = await listBranchesByOrganization(u.organizationId);
    if (!validBranches.some((b) => b.id === parsed.data.branchId)) {
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
      <PageHeader
        title="אזורי שירותים"
        description={`${restrooms.length} אזור${restrooms.length === 1 ? "" : "ים"} מוגדר${restrooms.length === 1 ? "" : "ים"} בארגון`}
      />

      {canEdit && (
        <Card className="border-brand-water/20 bg-brand-soft/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DoorOpen className="size-4 text-brand" aria-hidden="true" />
              הוספת אזור שירותים חדש
            </CardTitle>
            <CardDescription>בחר סניף ומלא את פרטי האזור.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleCreate} className="grid gap-4 sm:grid-cols-2 items-end max-w-2xl">
              <div className="sm:col-span-2">
                <Select name="branchId" label="סניף" required>
                  <option value="">בחר סניף...</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </div>
              <Input
                name="name"
                label="שם האזור"
                placeholder="לדוגמה: שירותי קומה 1"
                required
              />
              <Input name="floor" label="קומה" placeholder="0, 1, 2..." />
              <div className="sm:col-span-2">
                <Input name="area" label="תיאור האזור" placeholder="תיאור קצר (אופציונלי)" />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" variant="primary" size="md">
                  צור אזור שירותים
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {restrooms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted text-sm">
            <DoorOpen className="mx-auto mb-3 size-10 text-border" aria-hidden="true" />
            <p className="font-medium text-foreground">אין אזורי שירותים מוגדרים</p>
            <p className="mt-1">הוסף אזור שירותים חדש באמצעות הטופס למעלה.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {restrooms.map((r) => {
            const branch = branches.find((b) => b.id === r.branchId);
            return (
              <Card key={r.id} className={!r.isActive ? "opacity-60" : undefined}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                        <DoorOpen className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{r.name}</CardTitle>
                        <p className="mt-0.5 text-xs text-muted truncate">
                          {branch?.name && (
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="size-3 shrink-0" aria-hidden="true" />
                              {branch.name}
                            </span>
                          )}
                          {r.floor && ` · קומה ${r.floor}`}
                          {r.areaDescription && ` · ${r.areaDescription}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={r.isActive ? "secondary" : "outline"} className="shrink-0">
                      {r.isActive ? "פעיל" : "לא פעיל"}
                    </Badge>
                  </div>
                </CardHeader>
                {canEdit && r.isActive && (
                  <CardContent className="pt-0">
                    <form action={handleDeactivate.bind(null, r.id)}>
                      <Button variant="danger" size="sm">
                        השבת אזור
                      </Button>
                    </form>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
