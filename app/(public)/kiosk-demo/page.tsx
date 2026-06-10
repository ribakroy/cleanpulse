import Link from "next/link";
import { ArrowRight, QrCode } from "lucide-react";
import { PublicReportForm } from "@/components/kiosk/public-report-form";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { env } from "@/lib/utils/env";
import seededIssues from "@/data-seed/issue-types.json";

export const metadata = {
  title: "מסך טאבלט לדוגמה",
};

export default function KioskDemoPage() {
  const kioskUrl = `${env.appUrl}/kiosk-demo`;

  return (
    <div className="container-shell section-space">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary">תצוגת הדגמה</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">מסך טאבלט ציבורי</h1>
          <p className="max-w-2xl text-base leading-7 text-muted">
            מסך מגע גדול ונקי — כפי שייראה ב־kiosk אמיתי. לדיווח מהיר ונוח ישירות מהמיקום.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CopyButton value={kioskUrl} label="העתקת קישור הטאבלט" />
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white/85 px-4 py-2 text-sm font-medium text-foreground shadow-soft"
          >
            <ArrowRight className="size-4" aria-hidden="true" />
            חזרה לדף הבית
          </Link>
        </div>
      </div>

      <div className="surface-panel rounded-[var(--radius-xl)] p-4 sm:p-6">
        <div className="mb-8 flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border bg-white/85 px-4 py-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">קישור ציבורי לדוגמה</p>
            <p className="text-sm leading-7 text-muted">קישורי מסך אמיתיים מחוברים לטאבלטים בכל מיקום בארגון.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-2 text-sm font-medium text-brand-deep">
            <QrCode className="size-4" aria-hidden="true" />
            קישור QR פעיל
          </span>
        </div>

        <div className="max-w-4xl mx-auto py-8">
          <PublicReportForm
            token="demo-token"
            source="kiosk"
            branchName="סניף רמת אביב"
            restroomName="שירותי גברים קומה 1"
            issueTypes={seededIssues}
            isDemo={true}
          />
        </div>
      </div>
    </div>
  );
}
