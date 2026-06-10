import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NoAccessState } from "@/components/admin/no-access-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { canViewLocations, canManageSettings } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { listBranchesByOrganization, createBranch, deactivateBranch } from "@/lib/data/repositories/branches";
import { Building2, MapPin } from "lucide-react";

export const metadata = { title: "סניפים | CleanPulse" };

const branchSchema = z.object({
  name: z.string().min(2, "שם הסניף חייב להכיל לפחות 2 תווים"),
  address: z.string().optional(),
  city: z.string().optional(),
});

export default async function AdminBranchesPage() {
  const user = await requireUser();
  if (!canViewLocations(user))
    return <NoAccessState description="למשתמש הנוכחי אין הרשאה לצפות בסניפים." />;
  const canEdit = canManageSettings(user);
  const branches = await listBranchesByOrganization(user.organizationId);

  async function handleCreateBranch(formData: FormData) {
    "use server";
    const u = await requireUser();
    if (!canManageSettings(u)) throw new Error("Unauthorized");

    const parsed = branchSchema.safeParse({
      name: formData.get("name"),
      address: formData.get("address"),
      city: formData.get("city"),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message || "שגיאת אימות");
    }

    await createBranch(u.organizationId, {
      name: parsed.data.name,
      address: parsed.data.address || "",
      city: parsed.data.city || "",
      isActive: true,
    });
    revalidatePath("/admin/branches");
  }

  async function handleDeactivate(id: string) {
    "use server";
    const u = await requireUser();
    if (!canManageSettings(u)) throw new Error("Unauthorized");
    await deactivateBranch(u.organizationId, id);
    revalidatePath("/admin/branches");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="סניפים ומיקומים"
        description={`${branches.length} סניפ${branches.length === 1 ? "" : "ים"} מוגדר${branches.length === 1 ? "" : "ים"} בארגון`}
      />

      {canEdit && (
        <Card className="border-brand-water/20 bg-brand-soft/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4 text-brand" aria-hidden="true" />
              הוספת סניף חדש
            </CardTitle>
            <CardDescription>הזן את פרטי הסניף ולחץ על ״צור סניף״.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleCreateBranch} className="grid gap-4 sm:grid-cols-3 items-end max-w-2xl">
              <Input
                name="name"
                label="שם הסניף"
                placeholder="לדוגמה: סניף תל אביב"
                required
                minLength={2}
              />
              <Input
                name="city"
                label="עיר"
                placeholder="תל אביב"
              />
              <Input
                name="address"
                label="כתובת"
                placeholder="רחוב הרצל 12"
              />
              <div className="sm:col-span-3 flex justify-end">
                <Button type="submit" variant="primary" size="md">
                  צור סניף
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {branches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted text-sm">
            <Building2 className="mx-auto mb-3 size-10 text-border" aria-hidden="true" />
            <p className="font-medium text-foreground">אין סניפים מוגדרים</p>
            <p className="mt-1">הוסף את הסניף הראשון שלך למעלה.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {branches.map((b) => (
            <Card key={b.id} className={!b.isActive ? "opacity-60" : undefined}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      <Building2 className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{b.name}</CardTitle>
                      {(b.city || b.address) && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted truncate">
                          <MapPin className="size-3 shrink-0" aria-hidden="true" />
                          {[b.city, b.address].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={b.isActive ? "secondary" : "outline"} className="shrink-0">
                    {b.isActive ? "פעיל" : "לא פעיל"}
                  </Badge>
                </div>
              </CardHeader>
              {canEdit && b.isActive && (
                <CardContent className="pt-0">
                  <form action={handleDeactivate.bind(null, b.id)}>
                    <Button variant="danger" size="sm">
                      השבת סניף
                    </Button>
                  </form>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
