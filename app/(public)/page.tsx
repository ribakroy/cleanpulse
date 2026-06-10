import Link from "next/link";
import {
  Bell,
  CheckCircle,
  ChevronLeft,
  ClipboardList,
  Droplets,
  Lock,
  MailCheck,
  QrCode,
  ShieldCheck,
  TabletSmartphone,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/* ───── Feature cards (based on reference) ───── */
const features = [
  {
    icon: Bell,
    title: "התראות בזמן אמת",
    body: "כל דיווח מגיע ישירות לנמענים הנכונים. תגובה מהירה יותר ושירות ניקיון שמשתפר כל הזמן.",
  },
  {
    icon: ClipboardList,
    title: "לוחות בקרה חכמים",
    body: "מעקב אחר ביצועים, זמני תגובה, סטטוסים ומגמות — לוח בקרה ברור ומרכזי.",
  },
  {
    icon: MailCheck,
    title: "דוחות ותובנות",
    body: "דוחות ביצועים לניתוח בעיות חוזרות, שיפור מתמיד ומדידת איכות השירות.",
  },
];

/* ───── Trust items (bottom row) ───── */
const trustItems = [
  { icon: Lock, text: "אבטחת מידע ברמה ארגונית" },
  { icon: Zap, text: "זמינות גבוהה — 24/7" },
  { icon: ShieldCheck, text: "חוויית משתמש מעולה" },
  { icon: CheckCircle, text: "פריסה מהירה לשימוש" },
];

/* ───── Mock dashboard data for preview ───── */
const mockKpis = [
  { label: "סה\"כ דיווחים", value: "1,248", delta: "+12%" },
  { label: "טופלו היום", value: "47", delta: "+15%" },
  { label: "דיווחים פתוחים", value: "23", delta: "+8%" },
  { label: "זמן תגובה ממוצע", value: "18 דק'", delta: "-12%" },
];

const mockIncidents = [
  { time: "10:24", loc: "קומה 2, שירותי נשים — קריון עוזיאל תל אביב" },
  { time: "09:47", loc: "קומה 1, שירותי גברים — תחנת רכבת השלום" },
  { time: "08:31", loc: "קומה 0, שירותי נגישות — קריון עוזיאל תל אביב" },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur-md">
        <div className="container-shell flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="flex size-8 items-center justify-center rounded-xl bg-brand shadow-[0_4px_14px_rgba(30,136,229,0.4)]">
              <Droplets className="size-4 text-white" aria-hidden="true" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-foreground">CleanPulse</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
            {["פתרון", "משאבים", "מחירים", "צור קשר"].map((item) => (
              <span key={item} className="cursor-default hover:text-foreground transition-colors">{item}</span>
            ))}
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/kiosk-demo" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              <TabletSmartphone className="size-4" aria-hidden="true" />
              צפייה במסך דוגמה
            </Link>
            <Link href="/login" className={buttonVariants({ variant: "primary", size: "sm" })}>
              <Lock className="size-4" aria-hidden="true" />
              כניסה למנהלים
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="section-space"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 60% -10%, rgba(56,189,248,0.18) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 0% 70%, rgba(30,136,229,0.10) 0%, transparent 60%), #f4faff",
        }}
      >
        <div className="container-shell grid items-center gap-10 lg:grid-cols-2">
          {/* Left — copy */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-4 py-1.5 text-sm font-semibold text-brand">
              <span className="size-2 rounded-full bg-brand animate-pulse" aria-hidden="true" />
              מערכת ניהול ניקיון חכמה
            </div>

            <div className="space-y-4">
              <h1 className="text-balance text-5xl font-extrabold tracking-tight text-foreground lg:text-6xl">
                CleanPulse
              </h1>
              <p className="text-2xl font-bold text-brand">דיווחי שירותים בזמן אמת</p>
              <p className="max-w-md text-lg leading-8 text-muted">
                מערכת מתקדמת לדיווחים, מעקב וניהול תקלות בשירותים ציבוריים. תגובה מהירה יותר, שירות ניקי יותר, חוויית משתמש טובה יותר.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/login" className={buttonVariants({ variant: "primary", size: "xl" })}>
                <Lock className="size-5" aria-hidden="true" />
                כניסה למנהלים
              </Link>
              <Link href="/kiosk-demo" className={buttonVariants({ variant: "secondary", size: "xl" })}>
                <TabletSmartphone className="size-5" aria-hidden="true" />
                צפייה במסך דוגמה
              </Link>
            </div>
          </div>

          {/* Right — tablet mockup */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative">
              {/* Glow */}
              <div
                className="absolute inset-0 rounded-[2rem] opacity-40 blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(56,189,248,0.5) 0%, transparent 70%)" }}
                aria-hidden="true"
              />
              {/* Tablet frame */}
              <div className="relative rounded-[2rem] border-4 border-white bg-white shadow-[0_40px_120px_rgba(15,39,66,0.25)] overflow-hidden w-[340px] sm:w-[400px]">
                {/* Tablet top bar */}
                <div className="flex items-center justify-between bg-brand px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="size-4 text-white" aria-hidden="true" />
                    <span className="text-sm font-bold text-white">CleanPulse</span>
                  </div>
                  <div className="size-2 rounded-full bg-white/40" aria-hidden="true" />
                </div>

                {/* Tablet body */}
                <div className="bg-[#f4faff] p-6 space-y-5 min-h-[340px]">
                  <p className="text-center text-lg font-bold text-foreground">כיצד נוכל לעזור?</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: "🧴", label: "חסר ציוד" },
                      { icon: "🧹", label: "דורש ניקוי" },
                      { icon: "🚽", label: "תקלה אחרת" },
                    ].map(({ icon, label }) => (
                      <button
                        key={label}
                        className="flex flex-col items-center gap-2.5 rounded-2xl border-2 border-brand/20 bg-white p-4 text-center shadow-soft hover:border-brand hover:bg-brand-soft transition-all"
                        tabIndex={-1}
                        type="button"
                      >
                        <span className="text-3xl" role="img" aria-label={label}>{icon}</span>
                        <span className="text-xs font-bold text-foreground">{label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-brand-soft border border-brand/15 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <QrCode className="size-5 text-brand" aria-hidden="true" />
                      <span className="text-sm font-medium text-brand-deep">קישור QR פעיל</span>
                    </div>
                    <span className="text-xs text-muted">לחץ לדיווח מהיר</span>
                  </div>
                  <button
                    className="w-full rounded-2xl bg-brand py-3 text-sm font-bold text-white shadow-[0_6px_20px_rgba(30,136,229,0.35)] hover:bg-brand-deep transition-colors"
                    tabIndex={-1}
                    type="button"
                  >
                    בחר שפה
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="py-16">
        <div className="container-shell grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-[var(--radius-lg)] border border-border bg-white/85 p-7 space-y-4 shadow-soft hover:shadow-panel hover:-translate-y-1 transition-all duration-200"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="text-lg font-bold text-foreground">{title}</h2>
              <p className="text-sm leading-7 text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dashboard preview ── */}
      <section className="py-16 bg-white/50">
        <div className="container-shell space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-bold text-brand">תצוגה מקדימה</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">לוח הבקרה שלך</h2>
              <p className="text-muted text-base">כל מה שצריך לראות — במקום אחד, בזמן אמת.</p>
            </div>
            <Link href="/login" className={buttonVariants({ variant: "primary", size: "md" })}>
              פתיחת לוח הבקרה
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Mock dashboard shell */}
          <div className="rounded-[var(--radius-xl)] border border-border bg-white overflow-hidden shadow-panel">
            {/* Top bar */}
            <div className="flex items-center gap-3 border-b border-border bg-[#f4faff] px-5 py-3">
              <div className="flex gap-1.5" aria-hidden="true">
                <div className="size-3 rounded-full bg-red-300" />
                <div className="size-3 rounded-full bg-amber-300" />
                <div className="size-3 rounded-full bg-green-300" />
              </div>
              <div className="h-6 w-48 rounded-full bg-white border border-border text-xs text-muted flex items-center px-3">
                cleanpulse-beryl.vercel.app
              </div>
            </div>

            <div className="grid lg:grid-cols-[220px_1fr]">
              {/* Mock sidebar */}
              <div className="hidden lg:block border-l border-border bg-white p-4 space-y-1">
                <div className="flex items-center gap-2.5 px-3 py-2 mb-4">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-brand">
                    <Droplets className="size-3.5 text-white" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-bold">CleanPulse</span>
                </div>
                {["סקירה כללית", "דיווחים", "דוחות", "סניפים ומיקומים", "מסכים וקישורים", "נמעני מייל", "הגדרות"].map((item, i) => (
                  <div
                    key={item}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm ${i === 0 ? "bg-brand text-white font-bold" : "text-muted hover:bg-brand-soft"}`}
                  >
                    <div className={`size-4 rounded-md ${i === 0 ? "bg-white/30" : "bg-slate-100"}`} aria-hidden="true" />
                    {item}
                  </div>
                ))}
              </div>

              {/* Mock content */}
              <div className="p-5 space-y-5 bg-[#f4faff]">
                {/* KPI row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {mockKpis.map(({ label, value, delta }) => (
                    <div key={label} className="rounded-xl border border-border bg-white p-4 space-y-1.5">
                      <p className="text-[11px] text-muted font-medium">{label}</p>
                      <p className="text-xl font-extrabold text-foreground">{value}</p>
                      <p className={`text-[11px] font-bold ${delta.startsWith("+") ? "text-brand" : "text-red-500"}`}>
                        {delta} ← שבוע שעבר
                      </p>
                    </div>
                  ))}
                </div>

                {/* Chart area + recent */}
                <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
                  {/* Bar chart mock */}
                  <div className="rounded-xl border border-border bg-white p-4 space-y-3">
                    <p className="text-sm font-bold text-foreground">דיווחים לאורך זמן</p>
                    <div className="flex items-end gap-1 h-28 px-1">
                      {[40, 65, 55, 80, 70, 90, 60].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t"
                          style={{
                            height: `${h}%`,
                            background: i === 5
                              ? "linear-gradient(to top, #1e88e5, #38bdf8)"
                              : "rgba(30,136,229,0.15)",
                          }}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-muted px-0.5">
                      {["12/05","13/05","14/05","15/05","16/05","17/05","18/05"].map(d => <span key={d}>{d}</span>)}
                    </div>
                  </div>

                  {/* Recent incidents mock */}
                  <div className="rounded-xl border border-border bg-white p-4 space-y-3">
                    <p className="text-sm font-bold text-foreground">דיווחים אחרונים</p>
                    <div className="space-y-2.5">
                      {mockIncidents.map(({ time, loc }) => (
                        <div key={time} className="flex items-start justify-between gap-2 text-[11px] border-b border-border/50 pb-2 last:border-0 last:pb-0">
                          <span className="font-mono text-muted shrink-0">{time}<br />18/05</span>
                          <span className="text-foreground leading-5 text-right">{loc}</span>
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

      {/* ── Trust footer strip ── */}
      <section className="py-12 border-t border-border">
        <div className="container-shell grid grid-cols-2 gap-4 sm:grid-cols-4">
          {trustItems.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-foreground">{text}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
