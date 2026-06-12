import { describe, expect, it } from "vitest";
import {
  getBrandedEmailTemplateDefaults,
  renderBrandedEmailTemplate,
} from "@/lib/email/branded-email-templates";
import type { BrandedEmailTemplateKey } from "@/types/domain";

const templates: BrandedEmailTemplateKey[] = [
  "incident_alert",
  "urgent_incident_alert",
  "worker_task_assigned",
  "incident_resolved",
  "restroom_reset",
  "shift_summary",
  "shift_completion_required",
  "user_invite",
  "password_reset",
];

describe("branded RTL email templates", () => {
  it("renders every template with RTL HTML, text fallback and CTA link", () => {
    for (const template of templates) {
      const targetPath = template === "worker_task_assigned" ? "/work" : "/admin/reports/team";
      const email = renderBrandedEmailTemplate({
        template,
        ctaUrl: `https://cleanpulse.example/auth/magic?token=secret-${template}`,
        targetPath,
        recipientName: "רות",
        organizationName: "קפה דמו",
        details: [{ label: "בדיקה", value: "ערך" }],
        magicLinkGenerated: true,
      });

      expect(email.subject).toBe(getBrandedEmailTemplateDefaults(template).subject);
      expect(email.html).toContain('<html lang="he" dir="rtl">');
      expect(email.html).toContain("direction:rtl");
      expect(email.html).toContain("https://cleanpulse.example/auth/magic?token=secret-");
      expect(email.html).toContain(targetPath);
      expect(email.text).toContain(targetPath);
      expect(email.text).toContain("CleanPulse");
    }
  });

  it("escapes dynamic values and does not expose password or hash fields", () => {
    const email = renderBrandedEmailTemplate({
      template: "user_invite",
      ctaUrl: "https://cleanpulse.example/auth/magic?token=abc",
      targetPath: "/admin/dashboard",
      recipientName: "<script>alert(1)</script>",
      organizationName: "<b>Org</b>",
      details: [
        { label: "passwordHash", value: "should-not-be-raw" },
        { label: "שם", value: "<img src=x onerror=alert(1)>" },
      ],
      magicLinkGenerated: true,
    });

    expect(email.html).not.toContain("<script>");
    expect(email.html).not.toContain("<img src=x");
    expect(email.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(email.html).toContain("&lt;b&gt;Org&lt;/b&gt;");
    expect(email.html).not.toContain("temporaryPassword");
    expect(email.html).not.toContain("passwordHash:");
  });
});
