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

// In-process MVP rate limiter
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 10;

export async function loginAction(_: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const email = typeof emailValue === "string" ? normalizeEmail(emailValue) : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";

  const now = Date.now();
  const attemptRecord = loginAttempts.get(email);

  if (attemptRecord) {
    if (now > attemptRecord.resetAt) {
      loginAttempts.delete(email);
    } else if (attemptRecord.count >= MAX_ATTEMPTS) {
      const minutesLeft = Math.ceil((attemptRecord.resetAt - now) / 60000);
      return {
        email,
        error: `יותר מדי ניסיונות. נסה שוב בעוד ${minutesLeft} דקות.`,
      };
    }
  }

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
    const newRecord = loginAttempts.get(email) || { count: 0, resetAt: now + LOCKOUT_MINUTES * 60000 };
    newRecord.count += 1;
    loginAttempts.set(email, newRecord);

    return {
      email,
      error: genericLoginError,
    };
  }

  // Clear attempts on successful login
  loginAttempts.delete(email);

  await createSessionCookie(user);

  revalidatePath("/", "layout");
  if (user.role === "super_admin") {
    redirect("/super/dashboard");
  } else {
    redirect("/admin/dashboard");
  }
}
