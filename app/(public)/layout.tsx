import Link from "next/link";
import type { ReactNode } from "react";
import { Droplets, LayoutDashboard } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="container-shell py-4">
        <div className="surface-panel flex items-center justify-between gap-4 rounded-[var(--radius-lg)] px-4 py-3 sm:px-5">
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-foreground">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-brand-soft text-brand-deep">
              <Droplets className="size-5" aria-hidden="true" />
            </span>
            <span className="flex flex-col">
              <span className="text-base">CleanPulse</span>
              <span className="text-xs font-medium text-muted">דיווחי שירותים בזמן אמת</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link href="/kiosk-demo" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              מסך טאבלט לדוגמה
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "hidden sm:inline-flex")}
            >
              כניסה לניהול
            </Link>
            <Link href="/admin/dashboard" className={buttonVariants({ variant: "primary", size: "sm" })}>
              <LayoutDashboard className="size-4" aria-hidden="true" />
              דשבורד
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </>
  );
}
