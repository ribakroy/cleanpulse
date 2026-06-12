import { DataLayerError } from "@/lib/data/errors";
import { getDataAdapter } from "@/lib/data/get-data-adapter";
import { nowIso, normalizeEmail } from "@/lib/data/repositories/_shared";
import type { EmailDomainSettingsRecord } from "@/lib/data/types";
import { env } from "@/lib/utils/env";
import type { EmailMode, NotificationProvider } from "@/types/domain";

export const EMAIL_DOMAIN_SETTINGS_ID = "email_domain_settings";

export type EmailDomainSettingsInput = {
  appUrl: string;
  emailProvider: NotificationProvider;
  emailMode: EmailMode;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string | undefined;
  allowedTestRecipients?: string[] | undefined;
  domainStatus?: EmailDomainSettingsRecord["domainStatus"];
  resendDomain?: string | undefined;
};

function getDefaultSettingsAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://cleanpulse-beryl.vercel.app";
}

export function getDefaultEmailDomainSettings(updatedByUserId = "system"): EmailDomainSettingsRecord {
  const now = nowIso();

  return {
    id: EMAIL_DOMAIN_SETTINGS_ID,
    appUrl: getDefaultSettingsAppUrl(),
    emailProvider: "mock",
    emailMode: "mock",
    fromName: "CleanPulse",
    fromEmail: "no-reply@cleanpulse.local",
    replyToEmail: "",
    allowedTestRecipients: [],
    domainStatus: "not_configured",
    resendDomain: "",
    updatedAt: now,
    updatedByUserId,
    createdAt: now,
  };
}

function isLocalHttpUrl(url: URL) {
  return url.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
}

export function normalizeAppUrl(value: string, nodeEnv: string | undefined = process.env.NODE_ENV) {
  let parsed: URL;

  try {
    parsed = new URL(value.trim());
  } catch {
    throw new DataLayerError("EMAIL_SETTINGS_APP_URL_INVALID", "כתובת המערכת אינה תקינה.");
  }

  if (parsed.username || parsed.password) {
    throw new DataLayerError("EMAIL_SETTINGS_APP_URL_INVALID", "כתובת המערכת לא יכולה לכלול פרטי התחברות.");
  }

  if (parsed.protocol !== "https:" && !(nodeEnv !== "production" && isLocalHttpUrl(parsed))) {
    throw new DataLayerError("EMAIL_SETTINGS_APP_URL_INSECURE", "ב־production נדרשת כתובת HTTPS תקינה.");
  }

  return parsed.origin;
}

function normalizeEmailList(values: string[] | undefined) {
  return [...new Set((values ?? []).map(normalizeEmail).filter(Boolean))];
}

function assertValidEmail(value: string, fieldLabel: string) {
  const email = normalizeEmail(value);

  if (!email || !email.includes("@")) {
    throw new DataLayerError("EMAIL_SETTINGS_EMAIL_INVALID", `${fieldLabel} אינו אימייל תקין.`);
  }

  return email;
}

export function validateEmailDomainSettingsInput(
  input: EmailDomainSettingsInput,
  options: { nodeEnv?: string | undefined; resendApiKey?: string | undefined } = {},
) {
  const appUrl = normalizeAppUrl(input.appUrl, options.nodeEnv ?? process.env.NODE_ENV);
  const fromName = input.fromName.trim() || "CleanPulse";
  const fromEmail = assertValidEmail(input.fromEmail, "כתובת השולח");
  const replyToEmail = input.replyToEmail ? assertValidEmail(input.replyToEmail, "Reply-To") : "";
  const allowedTestRecipients = normalizeEmailList(input.allowedTestRecipients);
  const resendApiKey = options.resendApiKey ?? env.resendApiKey;

  if (input.emailMode === "live") {
    if (input.emailProvider !== "resend") {
      throw new DataLayerError("EMAIL_SETTINGS_LIVE_PROVIDER_INVALID", "מצב live דורש provider מסוג Resend.");
    }

    if (!resendApiKey) {
      throw new DataLayerError("EMAIL_SETTINGS_LIVE_BLOCKED", "לא ניתן להפעיל live בלי RESEND_API_KEY בסביבה.");
    }

    if (fromEmail.endsWith(".local")) {
      throw new DataLayerError("EMAIL_SETTINGS_LIVE_FROM_INVALID", "מצב live דורש כתובת שולח בדומיין אמיתי.");
    }

    if (input.domainStatus !== "verified") {
      throw new DataLayerError("EMAIL_SETTINGS_DOMAIN_NOT_VERIFIED", "לא ניתן להפעיל live לפני אימות דומיין.");
    }
  }

  if (input.emailMode === "test" && allowedTestRecipients.length === 0) {
    throw new DataLayerError("EMAIL_SETTINGS_TEST_RECIPIENTS_REQUIRED", "מצב test דורש לפחות נמען בדיקה אחד.");
  }

  return {
    appUrl,
    emailProvider: input.emailProvider,
    emailMode: input.emailMode,
    fromName,
    fromEmail,
    replyToEmail,
    allowedTestRecipients,
    domainStatus: input.domainStatus ?? "not_configured",
    resendDomain: input.resendDomain?.trim() || "",
  } satisfies EmailDomainSettingsInput;
}

export async function getEmailDomainSettings() {
  const settings = await getDataAdapter().get("system_settings", EMAIL_DOMAIN_SETTINGS_ID);

  return settings ?? getDefaultEmailDomainSettings();
}

export async function updateEmailDomainSettings(
  input: EmailDomainSettingsInput,
  updatedByUserId: string,
) {
  const normalized = validateEmailDomainSettingsInput(input);
  const existing = await getDataAdapter().get("system_settings", EMAIL_DOMAIN_SETTINGS_ID);
  const now = nowIso();

  if (!existing) {
    return getDataAdapter().create("system_settings", {
      ...getDefaultEmailDomainSettings(updatedByUserId),
      ...normalized,
      updatedByUserId,
      createdAt: now,
      updatedAt: now,
    });
  }

  return getDataAdapter().update("system_settings", EMAIL_DOMAIN_SETTINGS_ID, {
    ...normalized,
    updatedByUserId,
  });
}

export function isRecipientAllowedByEmailMode(settings: EmailDomainSettingsRecord, recipientEmail: string) {
  if (settings.emailMode === "mock") {
    return false;
  }

  if (settings.emailMode === "live") {
    return true;
  }

  return (settings.allowedTestRecipients ?? []).includes(normalizeEmail(recipientEmail));
}
