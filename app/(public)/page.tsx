import Link from "next/link";
import { Bell, ClipboardList, Copy, MailCheck, TabletSmartphone } from "lucide-react";
import { KioskPreview } from "@/components/kiosk/kiosk-preview";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { designTokens } from "@/lib/design-tokens";
import { env } from "@/lib/utils/env";

const featureCards = [
  {
    title: "התראות מייל ממוקדות",
    description: "כל דיווח זורם לנמענים הנכונים לפי מסך, שירותים, סניף או ברירת מחדל ארגונית.",
    icon: Bell,
  },
  {
    title: "לוח ניהול ברור",
    description: "צפייה באירועים פתוחים, טיפול, שיוך עובד ומדידת זמני תגובה בלי עומס מיותר.",
    icon: ClipboardList,
  },
  {
    title: "דוחות פשוטים למעקב",
    description: "תמונה יומית, שבועית וחודשית על ניקיון, תקלות חוזרות וזמני סגירה.",
    icon: MailCheck,
  },
];

const productHighlights = [
  "טאבלט ציבורי עם כפתורים גדולים במיוחד",
  "קישור גיבוי פומבי ל־QR",
  "RTL מלא ועברית בכל הממשק",
];

export default function HomePage() {
  const sampleKioskUrl = `${env.appUrl}/kiosk-demo`;

  return (
    <div className="section-space">
      <section className="container-shell">
        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <Badge variant="secondary">MVP בסיס הפרויקט</Badge>

            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                CleanPulse
              </h1>
              <p className="text-balance text-xl font-medium text-brand-deep sm:text-2xl">
                דיווחי שירותים בזמן אמת
              </p>
              <p className="max-w-2xl text-lg leading-8 text-muted">
                מערכת פשוטה לעסק לא טכני: מסך טאבלט ציבורי לדיווח מיידי, לוח ניהול עברי ומדידה
                תפעולית סביב ניקיון, תקלות ושירות.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className={buttonVariants({ variant: "primary", size: "xl" })}>
                כניסה לניהול
              </Link>
              <Link href="/kiosk-demo" className={buttonVariants({ variant: "secondary", size: "xl" })}>
                <TabletSmartphone className="size-5" aria-hidden="true" />
                צפייה במסך טאבלט לדוגמה
              </Link>
            </div>

            <div className="surface-panel rounded-[var(--radius-lg)] p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">קישור הדגמה מהיר</p>
                  <p className="text-sm leading-7 text-muted">
                    מוכן ל־preview מקומי, בלי שליחת מיילים בפועל ובלי חיבורים חיצוניים בשלב הזה.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton value={sampleKioskUrl} label="העתקת קישור הדגמה" />
                  <Button variant="ghost" size="sm" as="a" href={sampleKioskUrl}>
                    <Copy className="size-4" aria-hidden="true" />
                    פתח הדגמה
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {productHighlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full border border-border bg-white/75 px-4 py-2 text-sm font-medium text-foreground"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>

          <KioskPreview />
        </div>
      </section>

      <section className="container-shell mt-8 grid gap-4 md:grid-cols-3">
        {featureCards.map(({ title, description, icon: Icon }) => (
          <Card key={title}>
            <CardHeader>
              <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-deep">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="container-shell mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="grid-soft overflow-hidden">
          <CardHeader>
            <CardTitle>מה מקבלים במערכת</CardTitle>
            <CardDescription>
              מבנה בסיסי מוכן ל־auth, data adapters, מסך טאבלט ציבורי ולוח ניהול רספונסיבי.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[var(--radius-md)] border border-border bg-white/85 p-4">
              <p className="text-sm font-semibold text-foreground">מיילים</p>
              <p className="mt-2 text-sm leading-7 text-muted">
                התשתית בנויה ל־mock ול־Resend, אבל כרגע נשארת ללא שליחה חיצונית.
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-border bg-white/85 p-4">
              <p className="text-sm font-semibold text-foreground">דוחות</p>
              <p className="mt-2 text-sm leading-7 text-muted">
                מסכים יומיים, שבועיים וחודשיים יישבו על data adapter, בלי לערבב runtime data ב־repo הקוד.
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-border bg-white/85 p-4">
              <p className="text-sm font-semibold text-foreground">הרחבה עתידית</p>
              <p className="mt-2 text-sm leading-7 text-muted">
                המעבר ל־cleanpulse-data ול־Postgres עתידי נשמר נקי דרך adapter boundary ברור.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Design Tokens בסיסיים</CardTitle>
            <CardDescription>השפה הוויזואלית נעולה סביב כחול מים נקי, בהיר ו־RTL מלא.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-border bg-white/80 p-4">
              <span className="text-sm font-medium text-muted">Primary blue</span>
              <div className="flex items-center gap-3">
                <span
                  className="size-8 rounded-full border border-white shadow-soft"
                  style={{ backgroundColor: designTokens.colors.brand }}
                />
                <span className="font-mono text-sm text-foreground">{designTokens.colors.brand}</span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[var(--radius-md)] border border-border bg-surface-muted p-4">
                <p className="text-sm font-semibold text-foreground">צל</p>
                <p className="mt-2 text-sm leading-7 text-muted">עומק עדין, נקי ובהיר, עם תחושת מים וזרימה.</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-border bg-surface-muted p-4">
                <p className="text-sm font-semibold text-foreground">Radius</p>
                <p className="mt-2 text-sm leading-7 text-muted">פינות עגולות ורחבות לטאבלט, מובייל ודשבורד.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
