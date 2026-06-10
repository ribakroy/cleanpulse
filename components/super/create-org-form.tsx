"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, CheckCircle2, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { createOrganizationAction, type CreateOrgResult } from "@/app/super/organizations/new/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";

export function CreateOrgForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<CreateOrgResult["data"] | null>(null);
  
  // Custom password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [passwordVal, setPasswordVal] = useState(() => generateTempPassword());

  function generateTempPassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  }

  function handleRegeneratePassword() {
    setPasswordVal(generateTempPassword());
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set("ownerPassword", passwordVal); // Make sure password is sent

    startTransition(async () => {
      const result = await createOrganizationAction(formData);
      if (!result.success) {
        setError(result.error);
      } else if (result.data) {
        setSuccessData(result.data);
      }
    });
  }

  if (successData) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <Card className="border border-emerald-500/30 shadow-lg text-right bg-emerald-500/5">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500 shadow-md">
                <CheckCircle2 className="size-8 text-white" />
              </span>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">העסק נוצר בהצלחה!</CardTitle>
            <CardDescription className="text-muted mt-1">
              {successData.orgName} נוצר יחד עם משתמש הניהול.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-[var(--radius-lg)] border border-emerald-500/25 bg-surface-strong p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <ShieldAlert className="size-5 text-emerald-600" />
                <span className="font-bold text-foreground text-sm">פרטי גישה ראשוניים למנהל</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">כתובת אימייל:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground font-mono select-all">{successData.ownerEmail}</span>
                    <CopyButton value={successData.ownerEmail} label="העתק אימייל" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">סיסמה זמנית:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground font-mono select-all bg-brand-soft/40 px-2 py-1 rounded border border-border">
                      {successData.ownerPasswordPlain}
                    </span>
                    <CopyButton value={successData.ownerPasswordPlain} label="העתק סיסמה" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-md)] border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-800 leading-relaxed">
              <strong>שימו לב:</strong> הסיסמה הזמנית שמוצגת כאן מוצפנת בבסיס הנתונים ולא יהיה ניתן לראות אותה שוב. נא להעתיק אותה ולשלוח אותה בצורה מאובטחת ללקוח. עליו לשנות אותה בכניסתו הראשונה למערכת.
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  router.push("/super/organizations");
                  router.refresh();
                }}
              >
                חזרה לרשימת לקוחות
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  setSuccessData(null);
                  setError(null);
                  setPasswordVal(generateTempPassword());
                }}
              >
                הקמת עסק נוסף
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      {error && (
        <div className="rounded-[var(--radius-lg)] border border-danger/25 bg-danger/8 px-4 py-3.5 text-sm font-semibold text-danger">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Organization details */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="size-5 text-brand" />
              פרטי העסק
            </CardTitle>
            <CardDescription>שם העסק, תוכנית וגבייה.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="שם העסק *"
              name="name"
              type="text"
              placeholder="למשל: קפה סנטרל"
              required
            />
            <div className="space-y-1">
              <Input
                label="כתובת קישור *"
                name="slug"
                type="text"
                placeholder="למשל: central-cafe"
                required
              />
              <span className="text-[10px] text-muted block pr-1 leading-normal">
                באנגלית קטנה ומקפים בלבד.
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 text-right">
                <label htmlFor="plan" className="text-xs font-semibold text-muted">
                  תוכנית מנוי
                </label>
                <select
                  id="plan"
                  name="plan"
                  defaultValue="basic"
                  className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-border bg-white text-sm focus:outline-none focus:border-brand transition-colors"
                >
                  <option value="free">חינמי</option>
                  <option value="starter">מתחיל</option>
                  <option value="basic">בסיסי</option>
                  <option value="pro">מקצועי</option>
                  <option value="enterprise">ארגוני</option>
                </select>
              </div>

              <Input
                label="מגבלת מסכים מותרת"
                name="allowedScreensLimit"
                type="number"
                defaultValue={5}
                min={1}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="מחיר חודשי (ש״ח)"
                name="monthlyPrice"
                type="number"
                defaultValue={199}
                min={0}
                required
              />
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-semibold text-muted block">מטבע</label>
                <div className="h-10 px-3 flex items-center bg-brand-soft/30 border border-border rounded-[var(--radius-md)] text-sm font-bold text-muted">
                  שקל חדש (₪)
                </div>
              </div>
            </div>

            <Textarea
              label="הערות פנימיות"
              name="notes"
              placeholder="פרטים פנימיים שאינם חשופים ללקוח..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Contact and first user */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">איש קשר</CardTitle>
              <CardDescription>פרטים לשיחות וגבייה.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="שם איש הקשר"
                name="contactName"
                type="text"
                placeholder="למשל: ישראל ישראלי"
              />
              <Input
                label="טלפון ליצירת קשר"
                name="contactPhone"
                type="tel"
                placeholder="למשל: 050-0000000"
              />
              <Input
                label="אימייל לגבייה וחשבוניות"
                name="billingEmail"
                type="email"
                placeholder="billing@central.co.il"
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">משתמש מנהל ראשון</CardTitle>
              <CardDescription>המשתמש הראשי שיקבל גישה לאדמין העסק.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="שם מלא של המנהל *"
                name="ownerName"
                type="text"
                placeholder="למשל: דניאל כהן"
                required
              />
              <Input
                label="כתובת אימייל להתחברות *"
                name="ownerEmail"
                type="email"
                placeholder="manager@central.co.il"
                required
              />
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-semibold text-muted">סיסמה זמנית למשתמש</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordVal}
                      onChange={(e) => setPasswordVal(e.target.value)}
                      required
                      className="w-full h-10 px-4 rounded-[var(--radius-md)] border border-border bg-white text-sm font-mono focus:outline-none focus:border-brand transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-3 text-muted hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRegeneratePassword}
                  >
                    חולל סיסמה
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Link
          href="/super/organizations"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          ביטול וחזרה
        </Link>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin ml-2" />
              מקים עסק...
            </>
          ) : (
            "צור עסק ומשתמש"
          )}
        </Button>
      </div>
    </form>
  );
}
