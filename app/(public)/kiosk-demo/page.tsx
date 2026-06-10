import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicReportForm } from "@/components/kiosk/public-report-form";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { env } from "@/lib/utils/env";
import seededIssues from "@/data-seed/issue-types.json";

export const metadata = {
  title: "מסך טאבלט",
};

export default function KioskDemoPage() {
  const kioskUrl = `${env.appUrl}/kiosk-demo`;

  return (
    <div className="container-shell section-space">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary">תצוגת טאבלט</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">דיווח מהיר מהמיקום</h1>
          <p className="max-w-xl text-base leading-7 text-muted">מסך מגע נקי לדירוג או דיווח תקלה בשירותים.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
        <div className="mb-8 flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-white/85 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">קישור ציבורי פעיל</p>
            <p className="text-sm leading-6 text-muted">כך נראה מסך הדיווח בעסק.</p>
          </div>
          <CopyButton value={kioskUrl} label="העתקת קישור" />
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
