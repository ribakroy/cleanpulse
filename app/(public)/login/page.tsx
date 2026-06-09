import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";
import { env } from "@/lib/utils/env";

export const metadata = {
  title: "כניסה לניהול",
};

export default async function LoginPage() {
  const currentUser = await getCurrentUser();
  const showDemoNotice = process.env.NODE_ENV !== "production" || env.demoMode;

  if (currentUser?.isActive) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="container-shell flex min-h-[calc(100vh-8rem)] items-center justify-center py-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            התחברות מאובטחת
          </Badge>
          <CardTitle className="mt-3">כניסה לניהול</CardTitle>
          <CardDescription>
            כניסה עם אימייל וסיסמה, שמירת session ב־JWT cookie חתום, וגישה ניהולית רק לפי המשתמש
            והארגון שלו.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <LoginForm />

          {showDemoNotice ? (
            <div className="rounded-[var(--radius-md)] border border-border bg-surface-muted p-4 text-sm leading-7 text-muted">
              <div className="flex items-center gap-2 text-foreground">
                <ShieldCheck className="size-4 text-brand" aria-hidden="true" />
                <p className="font-semibold">אזור דמו לפיתוח</p>
              </div>
              <p className="mt-2">אימייל: owner@demo.local</p>
              <p>סיסמה: Demo123456!</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-deep hover:text-brand"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              מעבר לדשבורד המאובטח
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
