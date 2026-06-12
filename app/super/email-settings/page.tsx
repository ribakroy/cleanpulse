import { Mail, ShieldCheck, Wand2 } from "lucide-react";
import { createPreviewMagicLinkAction, updateEmailSettingsAction } from "@/app/super/email-settings/actions";
import { renderBrandedEmailTemplate } from "@/lib/email/branded-email-templates";
import { getEmailDomainSettings } from "@/lib/data/repositories/system-settings";
import { getDataAdapter } from "@/lib/data/get-data-adapter";
import type { BrandedEmailTemplateKey } from "@/types/domain";
import type { UserRecord } from "@/lib/data/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

type EmailSettingsPageProps = {
  searchParams: Promise<{
    template?: string | undefined;
    saved?: string | undefined;
    error?: string | undefined;
    link?: string | undefined;
    qaLink?: string | undefined;
  }>;
};

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

const templateLabels: Record<BrandedEmailTemplateKey, string> = {
  incident_alert: "דיווח חדש",
  urgent_incident_alert: "דיווח דחוף",
  worker_task_assigned: "משימת עובד",
  incident_resolved: "טיפול הושלם",
  restroom_reset: "ניקוי מקיף",
  shift_summary: "סיכום משמרת",
  shift_completion_required: "השלמת משמרת",
  user_invite: "הזמנת משתמש",
  password_reset: "איפוס סיסמה",
};

function normalizeTemplate(value: string | undefined): BrandedEmailTemplateKey {
  return templates.includes(value as BrandedEmailTemplateKey) ? value as BrandedEmailTemplateKey : "incident_alert";
}

function getPreviewTargetPath(template: BrandedEmailTemplateKey) {
  if (template === "worker_task_assigned") return "/work";
  if (template === "shift_summary") return "/admin/reports/team?shiftId=preview";
  if (template === "shift_completion_required") return "/admin/shifts?detectedShiftId=preview";
  if (template === "user_invite") return "/admin/dashboard";
  if (template === "password_reset") return "/login";
  return "/admin/incidents/incident_preview";
}

export default async function SuperEmailSettingsPage({ searchParams }: EmailSettingsPageProps) {
  const params = await searchParams;
  const settings = await getEmailDomainSettings();
  const selectedTemplate = normalizeTemplate(params.template);
  const targetPath = getPreviewTargetPath(selectedTemplate);
  const previewUrl = params.qaLink || `${settings.appUrl}/auth/magic?token=mock-preview-token`;
  const users = await getDataAdapter().list("users", {
    includeInactive: true,
    sortBy: "createdAt",
    sortDirection: "asc",
  }) as UserRecord[];
  const firstActiveUser = users.find((user) => user.isActive !== false);
  const preview = renderBrandedEmailTemplate({
    template: selectedTemplate,
    ctaUrl: previewUrl,
    targetPath,
    recipientName: "צוות CleanPulse",
    organizationName: "קפה דמו",
    details: [
      { label: "סניף", value: "רוטשילד" },
      { label: "אזור שירותים", value: "שירותי לקוחות - קומה 1" },
      { label: "סטטוס", value: params.qaLink ? "Magic link אמיתי נוצר ל-QA" : "Preview mock ללא שליחה" },
    ],
    magicLinkGenerated: true,
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">הגדרות מייל ודומיין</h1>
        <p className="mt-1 text-sm text-muted">
          תשתית מיילים ממותגת, preview ו־Magic Links. אין כאן ניהול secrets ואין הפעלת שליחה חיה.
        </p>
      </div>

      {params.saved && (
        <div className="rounded-[var(--radius-lg)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {params.saved}
        </div>
      )}
      {params.error && (
        <div className="rounded-[var(--radius-lg)] border border-danger/25 bg-danger/8 px-4 py-3 text-sm font-semibold text-danger">
          {params.error}
        </div>
      )}
      {params.link && params.qaLink && (
        <div className="rounded-[var(--radius-lg)] border border-brand-water bg-brand-soft px-4 py-3 text-sm text-brand-deep">
          <p className="font-bold">{params.link}</p>
          <a className="mt-1 block break-all text-left font-mono text-xs underline" dir="ltr" href={params.qaLink}>
            {params.qaLink}
          </a>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <Card className="border shadow-soft">
            <CardHeader className="border-b border-border bg-brand-soft/40">
              <div className="flex items-center gap-2">
                <Mail className="size-5 text-brand" />
                <CardTitle className="text-base font-bold">הגדרות בסיס</CardTitle>
              </div>
              <CardDescription>Super Admin בלבד. אין שמירת API keys במסך הזה.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <form action={updateEmailSettingsAction} className="grid gap-4">
                <Input name="appUrl" label="App URL" defaultValue={settings.appUrl} dir="ltr" className="text-left" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select name="emailProvider" label="Provider" defaultValue={settings.emailProvider}>
                    <option value="mock">mock</option>
                    <option value="resend">resend</option>
                  </Select>
                  <Select name="emailMode" label="Mode" defaultValue={settings.emailMode}>
                    <option value="mock">mock</option>
                    <option value="test">test</option>
                    <option value="live">live</option>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input name="fromName" label="שם שולח" defaultValue={settings.fromName} />
                  <Input name="fromEmail" label="אימייל שולח" defaultValue={settings.fromEmail} dir="ltr" className="text-left" />
                </div>
                <Input name="replyToEmail" label="Reply-To" defaultValue={settings.replyToEmail ?? ""} dir="ltr" className="text-left" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select name="domainStatus" label="סטטוס דומיין" defaultValue={settings.domainStatus ?? "not_configured"}>
                    <option value="not_configured">לא הוגדר</option>
                    <option value="pending">ממתין</option>
                    <option value="verified">מאומת</option>
                  </Select>
                  <Input name="resendDomain" label="דומיין Resend" defaultValue={settings.resendDomain ?? ""} dir="ltr" className="text-left" />
                </div>
                <label className="grid gap-2 text-sm font-medium text-foreground">
                  נמעני QA במצב test
                  <textarea
                    name="allowedTestRecipients"
                    defaultValue={(settings.allowedTestRecipients ?? []).join("\n")}
                    className="min-h-28 rounded-[var(--radius-md)] border border-border bg-white/90 px-4 py-3 text-left text-sm text-foreground shadow-soft outline-none focus:border-brand focus:bg-white focus:ring-3 focus:ring-brand/15"
                    dir="ltr"
                  />
                  <span className="text-xs font-normal text-muted">אימייל אחד בשורה או מופרד בפסיקים.</span>
                </label>
                <Button type="submit">
                  <ShieldCheck className="size-4" />
                  שמירת הגדרות
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border shadow-soft">
            <CardHeader className="border-b border-border bg-brand-soft/40">
              <div className="flex items-center gap-2">
                <Wand2 className="size-5 text-brand" />
                <CardTitle className="text-base font-bold">Magic Link ל־QA מקומי</CardTitle>
              </div>
              <CardDescription>זמין לבדיקת mock מוגנת. לא שולח מייל.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <form action={createPreviewMagicLinkAction} className="grid gap-4">
                <Input
                  name="userEmail"
                  label="אימייל משתמש"
                  defaultValue={firstActiveUser?.email ?? ""}
                  dir="ltr"
                  className="text-left"
                />
                <Input name="targetPath" label="Target path" defaultValue="/work" dir="ltr" className="text-left" />
                <Select name="purpose" label="Purpose" defaultValue="system_notification">
                  <option value="incident_alert">incident_alert</option>
                  <option value="worker_task">worker_task</option>
                  <option value="shift_summary">shift_summary</option>
                  <option value="user_invite">user_invite</option>
                  <option value="password_reset">password_reset</option>
                  <option value="system_notification">system_notification</option>
                  <option value="shift_completion_required">shift_completion_required</option>
                </Select>
                <Button type="submit" variant="secondary">
                  יצירת קישור QA
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border shadow-soft">
            <CardHeader className="border-b border-border bg-brand-soft/40">
              <CardTitle className="text-base font-bold">Preview תבנית</CardTitle>
              <CardDescription>HTML RTL + text fallback, בלי שליחה.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <form method="GET" action="/super/email-settings" className="flex flex-col gap-3 sm:flex-row">
                <Select name="template" label="תבנית" defaultValue={selectedTemplate}>
                  {templates.map((template) => (
                    <option key={template} value={template}>{templateLabels[template]}</option>
                  ))}
                </Select>
                <Button type="submit" variant="outline" className="self-end">
                  הצגת תבנית
                </Button>
              </form>
              <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-white">
                <iframe
                  title="Email HTML preview"
                  srcDoc={preview.html}
                  className="h-[520px] w-full bg-white"
                  sandbox=""
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-bold text-foreground">Text version</p>
                <pre className="max-h-64 overflow-auto rounded-[var(--radius-md)] border border-border bg-slate-950 p-4 text-left text-xs leading-6 text-slate-50" dir="ltr">
                  {preview.text}
                </pre>
              </div>
              <div className="rounded-[var(--radius-md)] border border-border bg-brand-soft/45 px-4 py-3 text-sm text-brand-deep">
                Target path: <span dir="ltr" className="font-mono">{targetPath}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
