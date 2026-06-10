"use server";

import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionCookie } from "@/lib/auth/session";
import { normalizeEmail } from "@/lib/data/repositories/_shared";
import { getUserByEmailForAuth } from "@/lib/data/repositories/users";

export type LoginActionState = {
  email: string;
  error: string | null;
};

const genericLoginError = "פרטי ההתחברות אינם תקינים.";

export async function loginAction(_: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const email = typeof emailValue === "string" ? normalizeEmail(emailValue) : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";

  if (!email || !password) {
    return {
      email,
      error: genericLoginError,
    };
  }

  const user = await getUserByEmailForAuth(email);

  if (!user || !user.isActive) {
    return {
      email,
      error: genericLoginError,
    };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash).catch(() => false);

  if (!isPasswordValid) {
    return {
      email,
      error: genericLoginError,
    };
  }

  await createSessionCookie(user);

  revalidatePath("/", "layout");
  if (user.role === "super_admin") {
    redirect("/super/dashboard");
  } else {
    redirect("/admin/dashboard");
  }
}
