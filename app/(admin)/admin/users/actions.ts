"use server";

import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { canManageUsers } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { createActivityLog } from "@/lib/data/repositories/activity-logs";
import { listBranchesByOrganization } from "@/lib/data/repositories/branches";
import { listRestroomsByOrganization } from "@/lib/data/repositories/restrooms";
import { getShiftById } from "@/lib/data/repositories/shifts";
import {
  createUser,
  getUserByEmailForAuth,
  getUserById,
  updateUser,
} from "@/lib/data/repositories/users";
import { normalizeEmail } from "@/lib/data/repositories/_shared";
import type { SafeUserRecord } from "@/lib/data/types";
import type { UserRole } from "@/types/domain";

export type UserManagementActionState = {
  ok: boolean;
  message: string | null;
  targetUserId?: string | undefined;
  temporaryPassword?: string | undefined;
};

const createRoles = new Set<UserRole>(["admin", "area_manager", "operations_worker"]);
const editableBusinessRoles = new Set<UserRole>([
  "owner",
  "admin",
  "area_manager",
  "operations_worker",
  "manager",
  "cleaner",
]);

function fail(message: string, targetUserId?: string): UserManagementActionState {
  return { ok: false, message, targetUserId };
}

function ok(message: string, targetUserId?: string, temporaryPassword?: string): UserManagementActionState {
  return { ok: true, message, targetUserId, temporaryPassword };
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getStrings(formData: FormData, key: string) {
  return formData.getAll(key).filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

function parseRole(value: string, allowedRoles: Set<UserRole>) {
  if (!allowedRoles.has(value as UserRole)) {
    throw new Error("תפקיד לא תקין");
  }

  return value as UserRole;
}

async function requireUsersManager() {
  const user = await requireUser();

  if (!canManageUsers(user)) {
    throw new Error("אין הרשאה לניהול משתמשים");
  }

  return user;
}

async function validateScopeIds(organizationId: string, branchIds: string[], restroomIds: string[]) {
  const [branches, restrooms] = await Promise.all([
    listBranchesByOrganization(organizationId),
    listRestroomsByOrganization(organizationId),
  ]);
  const validBranchIds = new Set(branches.map((branch) => branch.id));
  const validRestroomIds = new Set(restrooms.map((restroom) => restroom.id));

  if (branchIds.some((id) => !validBranchIds.has(id))) {
    throw new Error("נבחר סניף שאינו שייך לארגון");
  }

  if (restroomIds.some((id) => !validRestroomIds.has(id))) {
    throw new Error("נבחר אזור שירותים שאינו שייך לארגון");
  }
}

async function validateDefaultShiftId(organizationId: string, defaultShiftId: string) {
  if (!defaultShiftId) {
    return undefined;
  }

  const shift = await getShiftById(organizationId, defaultShiftId);
  if (!shift) {
    throw new Error("המשמרת שנבחרה אינה שייכת לארגון");
  }

  return shift.id;
}

function buildScopePatch(role: UserRole, branchIds: string[], restroomIds: string[]) {
  if (role === "owner" || role === "admin") {
    return {
      allowedBranchIds: [],
      allowedRestroomIds: [],
      assignedRestroomIds: [],
    };
  }

  if (role === "area_manager" || role === "manager") {
    return {
      allowedBranchIds: branchIds,
      allowedRestroomIds: restroomIds,
      assignedRestroomIds: [],
    };
  }

  return {
    allowedBranchIds: branchIds,
    allowedRestroomIds: restroomIds,
    assignedRestroomIds: restroomIds,
  };
}

function generateTemporaryPassword() {
  return `${randomBytes(9).toString("base64url")}A1!`;
}

function getFriendlyError(error: unknown) {
  if (error instanceof Error && /[\u0590-\u05FF]/.test(error.message)) {
    return error.message;
  }

  return "לא הצלחנו לבצע את הפעולה. נסה שוב בעוד רגע.";
}

async function writeUserActivityLog(input: {
  actor: SafeUserRecord;
  targetUserId: string;
  action: string;
  metadata?: Record<string, unknown> | undefined;
}) {
  await createActivityLog({
    organizationId: input.actor.organizationId,
    actorUserId: input.actor.id,
    actorFullName: input.actor.fullName,
    actorRole: input.actor.role,
    incidentId: null,
    action: input.action,
    actionType: input.action,
    targetType: "user",
    targetId: input.targetUserId,
    shiftId: input.actor.defaultShiftId,
    metadata: {
      actorName: input.actor.fullName,
      actorRole: input.actor.role,
      ...input.metadata,
    },
  });
}

export async function createBusinessUserAction(
  _: UserManagementActionState,
  formData: FormData,
): Promise<UserManagementActionState> {
  try {
    const actor = await requireUsersManager();
    const fullName = getString(formData, "fullName");
    const email = normalizeEmail(getString(formData, "email"));
    const phone = getString(formData, "phone");
    const jobTitle = getString(formData, "jobTitle");
    const role = parseRole(getString(formData, "role"), createRoles);
    const branchIds = getStrings(formData, "allowedBranchIds");
    const restroomIds = getStrings(formData, "allowedRestroomIds");
    const defaultShiftId = await validateDefaultShiftId(actor.organizationId, getString(formData, "defaultShiftId"));
    const providedPassword = getString(formData, "temporaryPassword");

    if (fullName.length < 2) {
      return fail("שם מלא חייב להכיל לפחות 2 תווים");
    }

    if (!email || !email.includes("@")) {
      return fail("כתובת מייל לא תקינה");
    }

    if (providedPassword && providedPassword.length < 8) {
      return fail("סיסמה זמנית חייבת להכיל לפחות 8 תווים");
    }

    const existingUser = await getUserByEmailForAuth(email);
    if (existingUser) {
      return fail("כבר קיים משתמש עם כתובת המייל הזו");
    }

    await validateScopeIds(actor.organizationId, branchIds, restroomIds);

    const generatedPassword = providedPassword ? "" : generateTemporaryPassword();
    const temporaryPassword = providedPassword || generatedPassword;
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);
    const scopePatch = buildScopePatch(role, branchIds, restroomIds);

    const created = await createUser({
      organizationId: actor.organizationId,
      email,
      fullName,
      passwordHash,
      role,
      phone: phone || undefined,
      jobTitle: jobTitle || undefined,
      defaultShiftId,
      isActive: true,
      ...scopePatch,
    });

    await writeUserActivityLog({
      actor,
      targetUserId: created.id,
      action: "user_created",
      metadata: {
        targetRole: role,
        targetEmail: email,
        defaultShiftId,
      },
    });

    revalidatePath("/admin/users");
    return ok(
      "המשתמש נוצר בהצלחה. מייל לא נשלח בפועל כי EMAIL_PROVIDER במצב mock.",
      created.id,
      generatedPassword || undefined,
    );
  } catch (error) {
    return fail(getFriendlyError(error));
  }
}

export async function updateBusinessUserAction(
  _: UserManagementActionState,
  formData: FormData,
): Promise<UserManagementActionState> {
  const targetUserId = getString(formData, "userId");

  try {
    const actor = await requireUsersManager();
    const targetUser = await getUserById(actor.organizationId, targetUserId);

    if (!targetUser) {
      return fail("המשתמש לא נמצא", targetUserId);
    }

    if (targetUser.role === "super_admin") {
      return fail("אי אפשר לערוך סופר אדמין ממסך ניהול עסקי", targetUserId);
    }

    const fullName = getString(formData, "fullName");
    const email = normalizeEmail(getString(formData, "email"));
    const phone = getString(formData, "phone");
    const jobTitle = getString(formData, "jobTitle");
    const role = parseRole(getString(formData, "role"), editableBusinessRoles);
    const branchIds = getStrings(formData, "allowedBranchIds");
    const restroomIds = getStrings(formData, "allowedRestroomIds");
    const defaultShiftId = await validateDefaultShiftId(actor.organizationId, getString(formData, "defaultShiftId"));
    const isActive = formData.get("isActive") === "on";

    if (targetUser.id === actor.id && !isActive) {
      return fail("אי אפשר להשבית את המשתמש המחובר", targetUserId);
    }

    if (fullName.length < 2) {
      return fail("שם מלא חייב להכיל לפחות 2 תווים", targetUserId);
    }

    if (!email || !email.includes("@")) {
      return fail("כתובת מייל לא תקינה", targetUserId);
    }

    const existingUser = await getUserByEmailForAuth(email);
    if (existingUser && existingUser.id !== targetUser.id) {
      return fail("כבר קיים משתמש עם כתובת המייל הזו", targetUserId);
    }

    await validateScopeIds(actor.organizationId, branchIds, restroomIds);
    const scopePatch = buildScopePatch(role, branchIds, restroomIds);

    await updateUser(targetUser.id, {
      email,
      fullName,
      role,
      phone: phone || undefined,
      jobTitle: jobTitle || undefined,
      defaultShiftId,
      isActive,
      ...scopePatch,
    });

    await writeUserActivityLog({
      actor,
      targetUserId: targetUser.id,
      action: "user_updated",
      metadata: {
        targetRole: role,
        targetEmail: email,
        defaultShiftId,
        isActive,
      },
    });

    revalidatePath("/admin/users");
    return ok("פרטי המשתמש נשמרו", targetUser.id);
  } catch (error) {
    return fail(getFriendlyError(error), targetUserId);
  }
}

export async function disableBusinessUserAction(
  _: UserManagementActionState,
  formData: FormData,
): Promise<UserManagementActionState> {
  const targetUserId = getString(formData, "userId");

  try {
    const actor = await requireUsersManager();
    const targetUser = await getUserById(actor.organizationId, targetUserId);

    if (!targetUser) {
      return fail("המשתמש לא נמצא", targetUserId);
    }

    if (targetUser.id === actor.id) {
      return fail("אי אפשר להשבית את המשתמש המחובר", targetUserId);
    }

    if (targetUser.role === "super_admin") {
      return fail("אי אפשר להשבית סופר אדמין ממסך ניהול עסקי", targetUserId);
    }

    await updateUser(targetUser.id, { isActive: false });
    await writeUserActivityLog({
      actor,
      targetUserId: targetUser.id,
      action: "user_disabled",
      metadata: {
        targetEmail: targetUser.email,
        targetRole: targetUser.role,
      },
    });

    revalidatePath("/admin/users");
    return ok("המשתמש הושבת", targetUser.id);
  } catch (error) {
    return fail(getFriendlyError(error), targetUserId);
  }
}

export async function resetBusinessUserPasswordAction(
  _: UserManagementActionState,
  formData: FormData,
): Promise<UserManagementActionState> {
  const targetUserId = getString(formData, "userId");

  try {
    const actor = await requireUsersManager();
    const targetUser = await getUserById(actor.organizationId, targetUserId);

    if (!targetUser) {
      return fail("המשתמש לא נמצא", targetUserId);
    }

    if (targetUser.role === "super_admin") {
      return fail("אי אפשר לאפס סיסמת סופר אדמין ממסך ניהול עסקי", targetUserId);
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);
    await updateUser(targetUser.id, { passwordHash });

    await writeUserActivityLog({
      actor,
      targetUserId: targetUser.id,
      action: "user_password_reset",
      metadata: {
        targetEmail: targetUser.email,
        targetRole: targetUser.role,
      },
    });

    revalidatePath("/admin/users");
    return ok("נוצרה סיסמה זמנית חדשה. מייל לא נשלח בפועל.", targetUser.id, temporaryPassword);
  } catch (error) {
    return fail(getFriendlyError(error), targetUserId);
  }
}
