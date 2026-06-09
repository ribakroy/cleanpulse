import type { DataAdapterMode, EmailProviderMode } from "@/types/env";

function resolveDataAdapter(value: string | undefined): DataAdapterMode {
  return value === "github" ? "github" : "local";
}

function resolveEmailProvider(value: string | undefined): EmailProviderMode {
  return value === "resend" ? "resend" : "mock";
}

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  authSecret: process.env.AUTH_SECRET ?? "",
  dataAdapter: resolveDataAdapter(process.env.DATA_ADAPTER),
  githubDataOwner: process.env.GITHUB_DATA_OWNER ?? "ribakroy",
  githubDataRepo: process.env.GITHUB_DATA_REPO ?? "cleanpulse-data",
  githubDataBranch: process.env.GITHUB_DATA_BRANCH ?? "main",
  githubDataToken: process.env.GITHUB_DATA_TOKEN ?? "",
  emailProvider: resolveEmailProvider(process.env.EMAIL_PROVIDER),
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "",
  emailReplyTo: process.env.EMAIL_REPLY_TO ?? "",
  demoMode: process.env.DEMO_MODE === "true",
} as const;

export function validateEnv() {
  if (typeof window !== "undefined") return;

  const errors: string[] = [];

  // Critical AUTH
  if (!env.authSecret) {
    errors.push("AUTH_SECRET is missing. It is required for signing session JWT cookies.");
  }

  // Critical DATA_ADAPTER=github
  if (env.dataAdapter === "github") {
    if (!process.env.GITHUB_DATA_OWNER) {
      errors.push("GITHUB_DATA_OWNER is missing (required when DATA_ADAPTER=github).");
    }
    if (!process.env.GITHUB_DATA_REPO) {
      errors.push("GITHUB_DATA_REPO is missing (required when DATA_ADAPTER=github).");
    }
    if (!process.env.GITHUB_DATA_BRANCH) {
      errors.push("GITHUB_DATA_BRANCH is missing (required when DATA_ADAPTER=github).");
    }
    if (!process.env.GITHUB_DATA_TOKEN) {
      errors.push("GITHUB_DATA_TOKEN is missing (required when DATA_ADAPTER=github).");
    }
  }

  // Critical EMAIL_PROVIDER=resend
  if (env.emailProvider === "resend") {
    if (!env.resendApiKey) {
      errors.push("RESEND_API_KEY is missing (required when EMAIL_PROVIDER=resend).");
    }
    if (!env.emailFrom) {
      errors.push("EMAIL_FROM is missing (required when EMAIL_PROVIDER=resend).");
    }
  }

  if (errors.length > 0) {
    const message = "❌ Environment validation failed:\n" + errors.map(e => ` - ${e}`).join("\n");
    console.error(message);
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing critical environment variables for production. See console logs for details.");
    }
  }
}

// Automatically validate on initialization
validateEnv();
