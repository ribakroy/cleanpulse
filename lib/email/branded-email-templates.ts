import { escapeHtml } from "@/lib/email/html";
import type { BrandedEmailTemplateKey } from "@/types/domain";

type EmailDetail = {
  label: string;
  value: string;
};

export type RenderBrandedEmailTemplateInput = {
  template: BrandedEmailTemplateKey;
  ctaUrl: string;
  targetPath: string;
  recipientName?: string | undefined;
  organizationName?: string | undefined;
  title?: string | undefined;
  lead?: string | undefined;
  details?: EmailDetail[] | undefined;
  magicLinkGenerated?: boolean | undefined;
};

const templateDefaults: Record<BrandedEmailTemplateKey, { subject: string; title: string; lead: string; cta: string }> = {
  incident_alert: {
    subject: "דיווח חדש ב-CleanPulse",
    title: "דיווח חדש התקבל",
    lead: "נפתח דיווח חדש שממתין לבדיקת הצוות.",
    cta: "צפייה בדיווח",
  },
  urgent_incident_alert: {
    subject: "דיווח דחוף ב-CleanPulse",
    title: "דיווח דחוף דורש טיפול",
    lead: "התקבל דיווח בעדיפות גבוהה. מומלץ לפתוח ולטפל מיד.",
    cta: "טיפול מיידי",
  },
  worker_task_assigned: {
    subject: "משימה חדשה ב-CleanPulse",
    title: "שויכה אליך משימת טיפול",
    lead: "משימה חדשה ממתינה באזור העבודה שלך.",
    cta: "פתיחת אזור העבודה",
  },
  incident_resolved: {
    subject: "טיפול הושלם ב-CleanPulse",
    title: "הטיפול בדיווח הושלם",
    lead: "הדיווח נסגר ותועד במערכת.",
    cta: "צפייה בסיכום",
  },
  restroom_reset: {
    subject: "ניקוי מקיף הושלם ב-CleanPulse",
    title: "בוצע ניקוי מקיף ואיפוס מצב",
    lead: "כל הפניות הפתוחות באזור נסגרו לאחר בדיקה מלאה.",
    cta: "צפייה בפעילות",
  },
  shift_summary: {
    subject: "סיכום משמרת ב-CleanPulse",
    title: "סיכום פעילות משמרת",
    lead: "דוח הצוות למשמרת מוכן לצפייה.",
    cta: "צפייה בדוח צוות",
  },
  shift_completion_required: {
    subject: "נדרשת השלמת פרטי משמרת ב-CleanPulse",
    title: "משמרת שזוהתה דורשת השלמה",
    lead: "CleanPulse זיהתה פעילות צוות שמתאימה למשמרת, אבל חסרים פרטים לאישור מלא.",
    cta: "השלמת פרטי המשמרת",
  },
  user_invite: {
    subject: "הוזמנת ל-CleanPulse",
    title: "כניסה ראשונה ל-CleanPulse",
    lead: "נפתח עבורך משתמש במערכת. ניתן להיכנס דרך הקישור או להתחבר עם אימייל וסיסמה.",
    cta: "כניסה ראשונה ל-CleanPulse",
  },
  password_reset: {
    subject: "איפוס סיסמה ב-CleanPulse",
    title: "בקשת איפוס סיסמה",
    lead: "התקבלה בקשה לאיפוס סיסמה. הקישור קצר חיים וחד פעמי.",
    cta: "איפוס סיסמה",
  },
};

function renderDetails(details: EmailDetail[]) {
  if (details.length === 0) {
    return "";
  }

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:22px;border:1px solid #D8ECFA;border-radius:12px;overflow:hidden;">
      <tbody>
        ${details.map((detail) => `
          <tr>
            <td style="padding:12px 14px;border-bottom:1px solid #D8ECFA;background:#F4FAFF;color:#64748B;font-size:13px;font-weight:700;width:38%;">${escapeHtml(detail.label)}</td>
            <td style="padding:12px 14px;border-bottom:1px solid #D8ECFA;background:#FFFFFF;color:#0F2742;font-size:14px;font-weight:700;">${escapeHtml(detail.value)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderTextDetails(details: EmailDetail[]) {
  return details.map((detail) => `${detail.label}: ${detail.value}`).join("\n");
}

function filterSafeDetails(details: EmailDetail[]) {
  return details.filter((detail) => !/(password|hash|secret|token)/i.test(`${detail.label} ${detail.value}`));
}

export function renderBrandedEmailTemplate(input: RenderBrandedEmailTemplateInput) {
  const defaults = templateDefaults[input.template];
  const subject = defaults.subject;
  const title = input.title ?? defaults.title;
  const lead = input.lead ?? defaults.lead;
  const ctaLabel = defaults.cta;
  const recipientName = input.recipientName?.trim() || "שלום";
  const organizationName = input.organizationName?.trim() || "CleanPulse";
  const details = filterSafeDetails(input.details ?? []);
  const safeCtaUrl = escapeHtml(input.ctaUrl);
  const safeTargetPath = escapeHtml(input.targetPath);

  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(subject)}</title>
</head>
<body dir="rtl" style="margin:0;padding:0;background:#F4FAFF;font-family:Arial,sans-serif;color:#0F2742;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" dir="rtl" style="width:100%;border-collapse:collapse;background:#F4FAFF;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:28px 14px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" dir="rtl" style="max-width:600px;width:100%;margin:0 auto;border-collapse:collapse;background:#FFFFFF;border:1px solid #D8ECFA;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;background:#0F2742;color:#FFFFFF;text-align:right;">
              <div style="font-size:13px;line-height:1.4;color:#BDEBFF;font-weight:700;">${escapeHtml(organizationName)}</div>
              <div style="margin-top:6px;font-size:24px;line-height:1.25;font-weight:800;color:#FFFFFF;">CleanPulse</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;text-align:right;direction:rtl;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#0F2742;">
              <p style="margin:0 0 10px;font-size:15px;color:#64748B;">${escapeHtml(recipientName)},</p>
              <h1 style="margin:0;font-size:26px;line-height:1.25;color:#0F2742;font-weight:800;">${escapeHtml(title)}</h1>
              <p style="margin:14px 0 0;font-size:16px;line-height:1.65;color:#334155;">${escapeHtml(lead)}</p>
              ${renderDetails(details)}
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:26px 0 0;border-collapse:collapse;">
                <tr>
                  <td align="center" bgcolor="#1E88E5" style="border-radius:999px;background:#1E88E5;">
                    <a href="${safeCtaUrl}" style="display:inline-block;padding:13px 24px;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:800;border-radius:999px;">${escapeHtml(ctaLabel)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:18px 0 0;font-size:12px;line-height:1.7;color:#64748B;">
                יעד במערכת: <span dir="ltr" style="unicode-bidi:bidi-override;">${safeTargetPath}</span>
              </p>
              ${input.magicLinkGenerated ? `
              <p style="margin:6px 0 0;font-size:12px;line-height:1.7;color:#64748B;">
                הקישור כולל כניסה מהירה, קצרה וחד־פעמית. התחברות רגילה עם אימייל וסיסמה נשארת זמינה.
              </p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;background:#F4FAFF;border-top:1px solid #D8ECFA;text-align:right;color:#64748B;font-size:12px;line-height:1.6;">
              ההודעה נוצרה אוטומטית על ידי CleanPulse. אין להשיב למייל זה אם לא הוגדרה כתובת Reply-To.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    "CleanPulse",
    "",
    `${recipientName},`,
    title,
    lead,
    "",
    renderTextDetails(details),
    "",
    `${ctaLabel}: ${input.ctaUrl}`,
    `יעד במערכת: ${input.targetPath}`,
    input.magicLinkGenerated ? "הקישור כולל כניסה מהירה, קצרה וחד־פעמית. התחברות רגילה נשארת זמינה." : "",
  ].filter(Boolean).join("\n");

  return {
    subject,
    html,
    text,
  };
}

export function getBrandedEmailTemplateDefaults(template: BrandedEmailTemplateKey) {
  return templateDefaults[template];
}
