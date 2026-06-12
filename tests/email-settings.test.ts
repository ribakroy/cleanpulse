import { describe, expect, it } from "vitest";
import {
  isRecipientAllowedByEmailMode,
  normalizeAppUrl,
  validateEmailDomainSettingsInput,
} from "@/lib/data/repositories/system-settings";

describe("email domain settings", () => {
  it("normalizes safe appUrl values and rejects invalid URLs", () => {
    expect(normalizeAppUrl("https://cleanpulse.example/app/path")).toBe("https://cleanpulse.example");
    expect(normalizeAppUrl("http://localhost:3000", "development")).toBe("http://localhost:3000");
    expect(() => normalizeAppUrl("javascript:alert(1)")).toThrow();
  });

  it("rejects non-https appUrl in production", () => {
    expect(() => normalizeAppUrl("http://cleanpulse.example", "production")).toThrow("HTTPS");
  });

  it("blocks live email mode without resend and verified domain settings", () => {
    expect(() => validateEmailDomainSettingsInput({
      appUrl: "https://cleanpulse.example",
      emailProvider: "mock",
      emailMode: "live",
      fromName: "CleanPulse",
      fromEmail: "no-reply@cleanpulse.local",
      allowedTestRecipients: [],
      domainStatus: "not_configured",
    }, { resendApiKey: "test-key" })).toThrow("Resend");

    expect(() => validateEmailDomainSettingsInput({
      appUrl: "https://cleanpulse.example",
      emailProvider: "resend",
      emailMode: "live",
      fromName: "CleanPulse",
      fromEmail: "no-reply@cleanpulse.example",
      allowedTestRecipients: [],
      domainStatus: "pending",
    }, { resendApiKey: "test-key" })).toThrow("אימות דומיין");
  });

  it("restricts test mode recipients to the configured QA allowlist", () => {
    const settings = validateEmailDomainSettingsInput({
      appUrl: "https://cleanpulse.example",
      emailProvider: "resend",
      emailMode: "test",
      fromName: "CleanPulse",
      fromEmail: "no-reply@cleanpulse.local",
      allowedTestRecipients: ["QA@Example.com"],
      domainStatus: "not_configured",
    });

    expect(isRecipientAllowedByEmailMode({ id: "email_domain_settings", createdAt: "", updatedAt: "", updatedByUserId: "u1", ...settings }, "qa@example.com")).toBe(true);
    expect(isRecipientAllowedByEmailMode({ id: "email_domain_settings", createdAt: "", updatedAt: "", updatedByUserId: "u1", ...settings }, "customer@example.com")).toBe(false);
  });
});
