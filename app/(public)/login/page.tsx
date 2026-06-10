import Link from "next/link";
import { Droplets, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { env } from "@/lib/utils/env";

export const metadata = {
  title: "כניסה לניהול | CleanPulse",
  description: "כניסה מאובטחת למערכת ניהול CleanPulse",
};

export default async function LoginPage() {
  const currentUser = await getCurrentUser();
  const showDemoNotice = process.env.NODE_ENV !== "production" || env.demoMode;

  if (currentUser?.isActive) {
    redirect("/admin/dashboard");
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-12"
      style={{
        background:
          "radial-gradient(ellipse at top right, rgba(56,189,248,0.18) 0%, transparent 55%), radial-gradient(ellipse at bottom left, rgba(30,136,229,0.12) 0%, transparent 50%), linear-gradient(160deg, #f0f8ff 0%, #f4faff 60%, #eef7ff 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="pointer-events-none absolute right-[8%] top-[12%] size-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[10%] left-[6%] size-56 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #1e88e5 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand shadow-[0_8px_24px_rgba(30,136,229,0.35)] transition-transform group-hover:-translate-y-0.5">
              <Droplets className="size-7 text-white" aria-hidden="true" />
            </span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              כניסה ל-CleanPulse
            </h1>
            <p className="mt-1 text-sm text-muted">ניהול ניקיון חכם — כניסה מאובטחת</p>
          </div>
        </div>

        {/* Login card */}
        <div className="surface-panel rounded-[var(--radius-xl)] p-7 sm:p-8">
          <LoginForm />

          {showDemoNotice && (
            <div className="mt-5 rounded-[var(--radius-md)] border border-brand/20 bg-brand-soft p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 shrink-0 text-brand" aria-hidden="true" />
                <p className="text-sm font-semibold text-brand-deep">גישת הדגמה</p>
              </div>
              <div className="mt-2 space-y-0.5 text-sm text-muted">
                <p>
                  <span className="text-foreground font-medium">אימייל:</span> owner@demo.local
                </p>
                <p>
                  <span className="text-foreground font-medium">סיסמה:</span> Demo123456!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-muted">
          <Link href="/" className="hover:text-brand hover:underline">
            חזרה לדף הבית
          </Link>
        </p>
      </div>
    </div>
  );
}
