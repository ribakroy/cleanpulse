import Link from "next/link";
import { Bell, CheckCircle, ChevronLeft, Droplets, Lock, QrCode, TabletSmartphone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const benefits = [
  {
    title: "דיווח בשנייה",
    body: "לקוחות מדווחים מהטאבלט או מסריקת QR, בלי התקנה ובלי הסברים.",
    icon: QrCode,
  },
  {
    title: "טיפול ברור",
    body: "המנהל רואה מיד מה פתוח, איפה זה נמצא ומה צריך לסגור עכשיו.",
    icon: Bell,
  },
  {
    title: "שיפור מתמשך",
    body: "דוחות נקיים עוזרים לזהות אזורים חוזרים ולשמור על שירות יציב.",
    icon: CheckCircle,
  },
];

const recentRows = [
  { title: "חסר סבון", place: "רוטשילד · קומה 1", status: "פתוח" },
  { title: "נדרש ניקוי", place: "רוטשילד · קומה 1", status: "בטיפול" },
  { title: "חסר נייר", place: "רוטשילד · קומה 1", status: "טופל" },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden bg-[#fbfdff]">
      <header className="sticky top-0 z-40 border-b border-border bg-white/88 backdrop-blur-md">
        <div className="container-shell flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-[var(--radius-md)] bg-brand shadow-[0_8px_20px_rgba(30,136,229,0.22)]">
              <Droplets className="size-4 text-white" aria-hidden="true" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-foreground">CleanPulse</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
            <Link href="#benefits" className="hover:text-foreground">יתרונות</Link>
            <Link href="#preview" className="hover:text-foreground">ניהול</Link>
            <Link href="#contact" className="hover:text-foreground">שיחה</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/kiosk-demo" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              <TabletSmartphone className="size-4" aria-hidden="true" />
              מסך טאבלט
            </Link>
            <Link href="/login" className={buttonVariants({ variant: "primary", size: "sm" })}>
              <Lock className="size-4" aria-hidden="true" />
              כניסה
            </Link>
          </div>
        </div>
      </header>

      <section className="section-space">
        <div className="container-shell grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-7">
            <div className="space-y-4">
              <h1 className="text-balance text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
                דיווחי שירותים בזמן אמת.
              </h1>
              <p className="max-w-xl text-xl font-semibold leading-8 text-brand-deep">
                CleanPulse עוזרת לעסק לראות תקלות, להגיב מהר ולשמור על שירותים נקיים.
              </p>
              <p className="max-w-lg text-base leading-7 text-muted">
                טאבלט ציבורי, QR ולוח ניהול עברי במקום אחד. בלי עומס, בלי רעש, רק מה שצריך לטיפול מהיר.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/login" className={buttonVariants({ variant: "primary", size: "xl" })}>
                כניסה לניהול
                <ChevronLeft className="size-5" aria-hidden="true" />
              </Link>
              <Link href="/kiosk-demo" className={buttonVariants({ variant: "secondary", size: "xl" })}>
                צפייה במסך טאבלט
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[520px] lg:ml-0">
            <div className="rounded-[1.75rem] border border-border bg-white p-3 shadow-panel">
              <div className="overflow-hidden rounded-[1.35rem] border border-border bg-brand-soft">
                <div className="flex items-center justify-between border-b border-border bg-white px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-[var(--radius-md)] bg-brand text-white">
                      <Droplets className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground">CleanPulse</p>
                      <p className="text-xs text-muted">מסך יציאה ראשי</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-brand/15 bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-deep">
                    פעיל
                  </span>
                </div>

                <div className="space-y-5 p-6">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-foreground">איך מצב השירותים?</p>
                    <p className="mt-1 text-sm text-muted">דירוג קצר או דיווח על תקלה</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {["חסר סבון", "נדרש ניקוי", "חסר נייר"].map((label) => (
                      <div key={label} className="rounded-[var(--radius-lg)] border border-border bg-white px-3 py-5 text-center shadow-soft">
                        <span className="text-sm font-bold text-foreground">{label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[var(--radius-lg)] border border-border bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-foreground">דורש טיפול עכשיו</p>
                        <p className="text-xs text-muted">3 דיווחים פתוחים</p>
                      </div>
                      <span className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-white">פתיחה</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      {recentRows.map((row) => (
                        <div key={`${row.title}-${row.status}`} className="flex items-center justify-between rounded-[var(--radius-md)] bg-brand-soft px-3 py-2 text-sm">
                          <div>
                            <p className="font-bold text-foreground">{row.title}</p>
                            <p className="text-xs text-muted">{row.place}</p>
                          </div>
                          <span className="text-xs font-semibold text-brand-deep">{row.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="border-y border-border bg-white py-16 scroll-mt-20">
        <div className="container-shell grid gap-5 md:grid-cols-3">
          {benefits.map(({ title, body, icon: Icon }) => (
            <div key={title} className="rounded-[var(--radius-lg)] border border-border bg-white p-6 shadow-soft">
              <span className="flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-brand-soft text-brand">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-lg font-bold text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="preview" className="py-20 scroll-mt-20">
        <div className="container-shell grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">מנהל רואה מה חשוב.</h2>
            <p className="max-w-md text-base leading-7 text-muted">
              המסך המרכזי שם את הדיווחים הפתוחים, המיקום והפעולה הבאה לפני כל דבר אחר.
            </p>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-border bg-white p-5 shadow-panel">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-muted">סקירה כללית</p>
                <p className="text-2xl font-extrabold text-foreground">דורש טיפול עכשיו</p>
              </div>
              <span className="rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-deep">3 פתוחים</span>
            </div>
            <div className="space-y-3">
              {recentRows.map((row) => (
                <div key={row.title} className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-[#fbfdff] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-bold text-foreground">{row.title}</p>
                    <p className="text-sm text-muted">{row.place}</p>
                  </div>
                  <span className="w-fit rounded-full border border-brand/20 bg-white px-3 py-1 text-sm font-semibold text-brand-deep">
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="border-t border-border bg-white py-10">
        <div className="container-shell flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-extrabold text-foreground">CleanPulse</p>
            <p className="text-sm text-muted">דיווחי שירותים בזמן אמת לעסקים.</p>
          </div>
          <Link href="/login" className={buttonVariants({ variant: "outline", size: "md" })}>
            כניסה למערכת
          </Link>
        </div>
      </footer>
    </div>
  );
}
