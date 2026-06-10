"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/session";
import { updateOrganization, getOrganizationById } from "@/lib/data/repositories/organizations";
import { updateUser, createUser, getUserByEmailForAuth } from "@/lib/data/repositories/users";
import { createActivityLog } from "@/lib/data/repositories/activity-logs";

export async function updateOrgStatusAction(orgId: string, status: "active" | "trial" | "suspended" | "cancelled") {
  try {
    await requireSuperAdmin();

    const isActive = status === "active" || status === "trial";
    const org = await getOrganizationById(orgId);
    if (!org) {
      return { success: false, error: "העסק לא נמצא." };
    }

    await updateOrganization(orgId, {
      status,
      isActive,
    });

    await createActivityLog({
      organizationId: "system",
      action: "organization_status_changed",
      metadata: {
        orgId,
        orgName: org.name,
        newStatus: status,
        isActive,
      },
    });

    revalidatePath(`/super/organizations/${orgId}`);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "שגיאה בעדכון סטטוס העסק." };
  }
}

export async function updateOrgDetailsAction(orgId: string, formData: FormData) {
  try {
    await requireSuperAdmin();

    const name = formData.get("name")?.toString().trim();
    const plan = formData.get("plan")?.toString() || "basic";
    const monthlyPrice = Number(formData.get("monthlyPrice") || 0);
    const allowedScreensLimit = Number(formData.get("allowedScreensLimit") || 5);
    const notes = formData.get("notes")?.toString().trim() || "";

    const contactName = formData.get("contactName")?.toString().trim() || "";
    const contactPhone = formData.get("contactPhone")?.toString().trim() || "";
    const billingEmail = formData.get("billingEmail")?.toString().trim().toLowerCase() || "";

    if (!name) {
      return { success: false, error: "שם העסק הוא שדה חובה." };
    }

    await updateOrganization(orgId, {
      name,
      plan: plan as "demo" | "basic" | "pro" | "enterprise" | "free" | "starter",
      monthlyPrice,
      allowedScreensLimit,
      notes,
      contactName,
      contactPhone,
      billingEmail,
    });

    await createActivityLog({
      organizationId: "system",
      action: "organization_details_updated",
      metadata: { orgId, name },
    });

    revalidatePath(`/super/organizations/${orgId}`);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "שגיאה בעדכון פרטי העסק." };
  }
}

export async function resetUserPasswordAction(orgId: string, userId: string, newPasswordPlain: string) {
  try {
    await requireSuperAdmin();

    if (!newPasswordPlain || newPasswordPlain.length < 6) {
      return { success: false, error: "הסיסמה חייבת להכיל 6 תווים לפחות." };
    }

    const passwordHash = await bcrypt.hash(newPasswordPlain, 12);
    await updateUser(userId, {
      passwordHash,
    });

    await createActivityLog({
      organizationId: "system",
      action: "user_password_reset_by_super",
      metadata: { userId, orgId },
    });

    revalidatePath(`/super/organizations/${orgId}`);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "שגיאה באיפוס הסיסמה." };
  }
}

export async function createOrgUserAction(
  orgId: string,
  email: string,
  fullName: string,
  passwordPlain: string,
  role: "owner" | "admin" | "manager" | "cleaner"
) {
  try {
    await requireSuperAdmin();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !fullName || !passwordPlain) {
      return { success: false, error: "נא למלא את כל שדות החובה." };
    }

    const existingUser = await getUserByEmailForAuth(normalizedEmail);
    if (existingUser) {
      return { success: false, error: `משתמש עם אימייל זה כבר קיים במערכת (${normalizedEmail}).` };
    }

    const passwordHash = await bcrypt.hash(passwordPlain, 12);
    await createUser({
      organizationId: orgId,
      email: normalizedEmail,
      fullName,
      passwordHash,
      role,
      isActive: true,
    });

    await createActivityLog({
      organizationId: "system",
      action: "user_created_by_super",
      metadata: { orgId, email: normalizedEmail, role },
    });

    revalidatePath(`/super/organizations/${orgId}`);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "שגיאה ביצירת משתמש נוסף." };
  }
}
