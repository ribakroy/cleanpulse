"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createMagicLoginLink } from "@/lib/auth/magic-login";
import { requireSuperAdmin } from "@/lib/auth/session";
import { getUserByEmailForAuth } from "@/lib/data/repositories/users";
import {
  getEmailDomainSettings,
  updateEmailDomainSettings,
} from "@/lib/data/repositories/system-settings";
import type { EmailMode, MagicLoginPurpose, NotificationProvider } from "@/types/domain";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(status: "saved" | "error" | "link", message: string, extra?: string): never {
  const url = new URL("/super/email-settings", "https://cleanpulse.local");
  url.searchParams.set(status, message);

  if (extra) {
    url.searchParams.set("qaLink", extra);
  }

  redirect(`${url.pathname}${url.search}`);
}

export async function updateEmailSettingsAction(formData: FormData) {
  const actor = await requireSuperAdmin();
  const allowedTestRecipients = getString(formData, "allowedTestRecipients")
    .split(/[\n,]/)
    .map((email) => email.trim())
    .filter(Boolean);

  try {
    await updateEmailDomainSettings(
      {
        appUrl: getString(formData, "appUrl"),
        emailProvider: getString(formData, "emailProvider") as NotificationProvider,
        emailMode: getString(formData, "emailMode") as EmailMode,
        fromName: getString(formData, "fromName"),
        fromEmail: getString(formData, "fromEmail"),
        replyToEmail: getString(formData, "replyToEmail"),
        allowedTestRecipients,
        domainStatus: formData.get("domainStatus") as "not_configured" | "pending" | "verified",
        resendDomain: getString(formData, "resendDomain"),
      },
      actor.id,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "שמירת ההגדרות נכשלה.";
    redirectWithMessage("error", message);
  }

  revalidatePath("/super/email-settings");
  redirectWithMessage("saved", "ההגדרות נשמרו במצב בטוח. לא נשלח מייל אמיתי.");
}

export async function createPreviewMagicLinkAction(formData: FormData) {
  const actor = await requireSuperAdmin();
  const settings = await getEmailDomainSettings();

  if (process.env.NODE_ENV === "production" && settings.emailMode !== "mock") {
    redirectWithMessage("error", "קישור preview גולמי זמין רק במצב mock/local.");
  }

  const email = getString(formData, "userEmail");
  const targetPath = getString(formData, "targetPath") || "/work";
  const purpose = (getString(formData, "purpose") || "system_notification") as MagicLoginPurpose;
  const user = await getUserByEmailForAuth(email);

  if (!user) {
    return redirectWithMessage("error", "לא נמצא משתמש בארגון של מנהל העל.");
  }

  const link = await createMagicLoginLink({
    user,
    targetPath,
    purpose,
    ttlMinutes: 20,
    createdByUserId: actor.id,
    metadata: {
      source: "super_email_settings_preview",
    },
    appUrl: settings.appUrl,
  });

  revalidatePath("/super/email-settings");
  redirectWithMessage("link", "נוצר קישור QA מקומי. לא נשלח מייל.", link.url);
}
