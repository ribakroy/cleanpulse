import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NoAccessState } from "@/components/admin/no-access-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { canViewLocations, canManageSettings } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { listBranchesByOrganization, createBranch, deactivateBranch } from "@/lib/data/repositories/branches";

export const metadata = { title: "סניפים" };

const branchSchema = z.object({
  name: z.string().min(2, "שם הסניף חייב להכיל לפחות 2 תווים"),
  address: z.string().optional(),
  city: z.string().optional(),
});

export default async function AdminBranchesPage() {
  const user = await requireUser();
  if (!canViewLocations(user)) return <NoAccessState description="למשתמש הנוכחי אין הרשאה לצפות בסניפים." />;
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
      console.error(parsed.error.issues);
      throw new Error(parsed.error.issues[0]?.message || "Validation Error");
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
      <PageHeader title="סניפים" description="ניהול סניפים בארגון" />
      
      {canEdit && (
        <Card className="bg-brand-soft border-border">
          <CardHeader><CardTitle>צור סניף חדש</CardTitle></CardHeader>
          <CardContent>
            <form action={handleCreateBranch} className="flex flex-col gap-3 max-w-sm">
              <input name="name" placeholder="שם סניף (לפחות 2 תווים)" required minLength={2} className="border p-2 rounded" />
              <input name="city" placeholder="עיר (אופציונלי)" className="border p-2 rounded" />
              <input name="address" placeholder="כתובת (אופציונלי)" className="border p-2 rounded" />
              <Button type="submit" className="bg-brand text-white">צור סניף</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {branches.map(b => (
          <Card key={b.id}>
            <CardHeader>
              <CardTitle>{b.name} {!b.isActive && "(לא פעיל)"}</CardTitle>
              <CardDescription>{b.city} - {b.address}</CardDescription>
            </CardHeader>
            <CardContent>
              {canEdit && b.isActive && (
                <form action={handleDeactivate.bind(null, b.id)}>
                  <Button variant="danger" size="sm">השבת סניף</Button>
                </form>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
