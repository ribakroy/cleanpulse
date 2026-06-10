"use server";

import bcrypt from "bcrypt";
import { requireSuperAdmin } from "@/lib/auth/session";
import { getOrganizationBySlug, createOrganization } from "@/lib/data/repositories/organizations";
import { getUserByEmailForAuth, createUser } from "@/lib/data/repositories/users";
import { createActivityLog } from "@/lib/data/repositories/activity-logs";

export type CreateOrgResult = {
  success: boolean;
  error: string | null;
  data?: {
    orgId: string;
    orgName: string;
    ownerEmail: string;
    ownerPasswordPlain: string;
  };
};

export async function createOrganizationAction(formData: FormData): Promise<CreateOrgResult> {
  try {
    // 1. Ensure caller is super_admin
    await requireSuperAdmin();

    // 2. Extract and validate data
    const name = formData.get("name")?.toString().trim();
    const slug = formData.get("slug")?.toString().trim().toLowerCase();
    const plan = formData.get("plan")?.toString() || "basic";
    const monthlyPrice = Number(formData.get("monthlyPrice") || 0);
    const allowedScreensLimit = Number(formData.get("allowedScreensLimit") || 5);
    const notes = formData.get("notes")?.toString().trim() || "";

    const contactName = formData.get("contactName")?.toString().trim() || "";
    const contactPhone = formData.get("contactPhone")?.toString().trim() || "";
    const billingEmail = formData.get("billingEmail")?.toString().trim().toLowerCase() || "";

    const ownerName = formData.get("ownerName")?.toString().trim();
    const ownerEmail = formData.get("ownerEmail")?.toString().trim().toLowerCase();
    const ownerPassword = formData.get("ownerPassword")?.toString();

    if (!name || !slug || !ownerName || !ownerEmail || !ownerPassword) {
      return { success: false, error: "נא למלא את כל שדות החובה המסומנים בכוכבית." };
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return { success: false, error: "הסלאג יכול להכיל אותיות קטנות באנגלית, מספרים ומקפים בלבד (למשל: my-business)." };
    }

    // 3. Check if organization slug is taken
    const existingOrg = await getOrganizationBySlug(slug);
    if (existingOrg) {
      return { success: false, error: `קיים כבר עסק עם כתובת מותג (Slug) זו: ${slug}. נא לבחור כתובת אחרת.` };
    }

    // 4. Check if owner email is taken
    const existingUser = await getUserByEmailForAuth(ownerEmail);
    if (existingUser) {
      return { success: false, error: `קיים כבר משתמש רשום עם כתובת האימייל הזו במערכת: ${ownerEmail}.` };
    }

    // 5. Create Organization
    const createdOrg = await createOrganization({
      name,
      slug,
      plan: plan as "demo" | "basic" | "pro" | "enterprise" | "free" | "starter",
      isActive: true,
      status: "active",
      billingStatus: "trialing",
      billingEmail: billingEmail || ownerEmail,
      companyName: name,
      contactName: contactName || ownerName,
      contactPhone,
      notes,
      allowedScreensLimit,
      monthlyPrice,
      currency: "ILS",
    });

    // 6. Encrypt Password
    const passwordHash = await bcrypt.hash(ownerPassword, 12);

    // 7. Create Owner User
    await createUser({
      organizationId: createdOrg.id,
      email: ownerEmail,
      fullName: ownerName,
      passwordHash,
      role: "owner",
      isActive: true,
    });

    // 8. Log internal activity
    await createActivityLog({
      organizationId: "system",
      action: "organization_created",
      metadata: {
        orgId: createdOrg.id,
        orgName: createdOrg.name,
        slug: createdOrg.slug,
        plan: createdOrg.plan,
      },
    });

    return {
      success: true,
      error: null,
      data: {
        orgId: createdOrg.id,
        orgName: createdOrg.name,
        ownerEmail,
        ownerPasswordPlain: ownerPassword,
      },
    };
  } catch (err: unknown) {
    console.error("Error creating organization:", err);
    return { success: false, error: err instanceof Error ? err.message : "שגיאה פנימית שרת בעת יצירת העסק." };
  }
}
