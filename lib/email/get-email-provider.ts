import { env } from "@/lib/utils/env";
import type { EmailProvider } from "./email-provider";
import { MockEmailProvider } from "./mock-email-provider";
import { ResendEmailProvider } from "./resend-email-provider";

let cachedProvider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (!cachedProvider) {
    cachedProvider = env.emailProvider === "resend" ? new ResendEmailProvider() : new MockEmailProvider();
  }
  return cachedProvider;
}

export function resetEmailProviderForTesting() {
  cachedProvider = null;
}

export function setEmailProviderForTesting(provider: EmailProvider | null) {
  cachedProvider = provider;
}

