import Link from "next/link";
import { ArrowRight, Droplets, Home, Lock, TabletSmartphone } from "lucide-react";
import { PublicReportForm } from "@/components/kiosk/public-report-form";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { buttonVariants } from "@/components/ui/button";
import { env } from "@/lib/utils/env";
import seededIssues from "@/data-seed/issue-types.json";

export const metadata = {
  title: "מסך טאבלט",
};

export default function KioskDemoPage() {
  const kioskUrl = `${env.appUrl}/kiosk-demo`;

  return (
    <div className="min-h-screen bg-[#f4faff]">
      <header className="sticky top-0 z-40 border-b border-border bg-white/88 backdrop-blur-md">
        <div className="container-shell flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-[var(--radius-md)] bg-brand shadow-[0_8px_20px_rgba(30,136,229,0.22)]">
              <Droplets className="size-4 text-white" aria-hidden="true" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-foreground">CleanPulse</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
            <Link href="/" className="hover:text-foreground">דף הבית</Link>
            <Link href="/login" className="hover:text-foreground">כניסה למנהלים</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              <Home className="size-4" aria-hidden="true" />
              בית
            </Link>
            <Link href="/login" className={buttonVariants({ variant: "primary", size: "sm" })}>
              <Lock className="size-4" aria-hidden="true" />
              כניסה
            </Link>
          </div>
        </div>
      </header>

      <main className="container-shell section-space">
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

        <div className="mt-8 flex justify-center">
          <Link href="/" className={buttonVariants({ variant: "outline", size: "md" })}>
            חזרה לדף הבית
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </main>

      <footer className="border-t border-border bg-white py-8">
        <div className="container-shell flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-[var(--radius-md)] bg-brand text-white">
              <Droplets className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-foreground">CleanPulse</p>
              <p className="text-xs text-muted">תצוגת טאבלט לדיווח מהיר</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link href="/" className="text-muted hover:text-foreground">דף הבית</Link>
            <span className="text-border">·</span>
            <Link href="/login" className="text-muted hover:text-foreground">כניסה למנהלים</Link>
            <span className="text-border">·</span>
            <Link href="/kiosk-demo" className="inline-flex items-center gap-1 font-semibold text-brand">
              <TabletSmartphone className="size-4" aria-hidden="true" />
              מסך טאבלט
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
