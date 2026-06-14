"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-12"
      dir="rtl"
      style={{
        background:
          "radial-gradient(ellipse at top right, rgba(56,189,248,0.16) 0%, transparent 55%), linear-gradient(160deg, #f0f8ff 0%, #f7fbff 100%)",
      }}
    >
      <section className="surface-panel w-full max-w-md rounded-[var(--radius-xl)] p-7 text-right shadow-soft sm:p-8">
        <p className="text-sm font-bold text-brand">CleanPulse</p>
        <h1 className="mt-3 text-2xl font-extrabold text-foreground">משהו לא נטען</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          שירות הנתונים לא זמין כרגע. אפשר לנסות שוב בעוד רגע.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={reset} size="md">
            <RefreshCw className="size-4" aria-hidden="true" />
            נסה שוב
          </Button>
          <Link href="/login" className={buttonVariants({ variant: "outline", size: "md" })}>
            חזרה לכניסה
          </Link>
        </div>
      </section>
    </main>
  );
}
