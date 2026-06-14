import Image from "next/image";
import Link from "next/link";
import { Droplets, Home, Lock } from "lucide-react";
import { PublicReportForm } from "@/components/kiosk/public-report-form";
import { buttonVariants } from "@/components/ui/button";
import seededIssues from "@/data-seed/issue-types.json";

export const metadata = {
  title: "מסך טאבלט",
};

export default function KioskDemoPage() {
  return (
    <div className="kiosk-demo-page min-h-screen bg-[#f4faff]">
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

      <main className="container-shell kiosk-demo-main">
        <section className="kiosk-device-stage" aria-label="הדמיית מסך טאבלט לדיווח מהיר">
          <div className="kiosk-device-shell">
            <Image
              src="/kiosk/tablet-mockup-cropped.png"
              alt=""
              fill
              priority
              sizes="(max-width: 760px) 176vw, (max-width: 1200px) 100vw, 56rem"
              className="kiosk-device-frame"
              aria-hidden="true"
            />
            <div className="kiosk-device-screen">
              <div className="kiosk-device-screen-inner">
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
        </section>

      </main>
    </div>
  );
}
