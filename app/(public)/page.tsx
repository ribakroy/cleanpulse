import Link from "next/link";
import {
  Bell,
  CheckCircle,
  ChevronLeft,
  ClipboardList,
  Droplets,
  Lock,
  MailCheck,
  MapPin,
  QrCode,
  ShieldCheck,
  TabletSmartphone,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

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

const trustItems = [
  { icon: Lock, text: "אבטחת מידע ברמה ארגונית" },
  { icon: Zap, text: "זמינות גבוהה לאורך היום" },
  { icon: ShieldCheck, text: "חוויית משתמש מעולה" },
  { icon: CheckCircle, text: "פריסה מהירה לשימוש" },
];

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

const tabletActions = [
  { icon: Droplets, label: "חסר ציוד" },
  { icon: ClipboardList, label: "דורש ניקוי" },
  { icon: Bell, label: "תקלה אחרת" },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">

      <header className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur-md">
        <div className="container-shell flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="flex size-8 items-center justify-center rounded-xl bg-brand shadow-[0_4px_14px_rgba(30,136,229,0.4)]">
              <Droplets className="size-4 text-white" aria-hidden="true" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-foreground">CleanPulse</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
            {[
              { label: "פתרון", href: "#solution" },
              { label: "לוח בקרה", href: "#resources" },
              { label: "מסלולים", href: "#pricing" },
              { label: "שיחה", href: "#contact" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/kiosk-demo"
              className="hidden h-10 items-center justify-center gap-2 rounded-full bg-transparent px-4 text-sm font-medium text-muted hover:bg-brand-soft hover:text-brand-deep sm:inline-flex"
            >
              <TabletSmartphone className="size-4" aria-hidden="true" />
              צפייה במסך טאבלט
            </Link>
            <Link href="/login" className={buttonVariants({ variant: "primary", size: "sm" })}>
              <Lock className="size-4" aria-hidden="true" />
              <span className="sm:hidden">כניסה</span>
              <span className="hidden sm:inline">כניסה למנהלים</span>
            </Link>
          </div>
        </div>
      </header>

      <section
        className="section-space"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 60% -10%, rgba(56,189,248,0.18) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 0% 70%, rgba(30,136,229,0.10) 0%, transparent 60%), #f4faff",
        }}
      >
        <div className="container-shell grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-4 py-1.5 text-sm font-semibold text-brand">
              <span className="size-2 rounded-full bg-brand animate-pulse" aria-hidden="true" />
              מערכת ניהול ניקיון לעסקים
            </div>

            <div className="space-y-4">
              <h1 className="text-balance text-5xl font-extrabold tracking-tight text-foreground lg:text-6xl">
                CleanPulse
              </h1>
              <p className="text-2xl font-bold text-brand">דיווחי שירותים בזמן אמת</p>
              <p className="max-w-md text-lg leading-8 text-muted">
                מערכת לדיווחים, מעקב וטיפול בתקלות בשירותים ציבוריים. תגובה מהירה יותר, שירות נקי יותר וחוויית לקוח טובה יותר.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/login" className={buttonVariants({ variant: "primary", size: "xl" })}>
                <Lock className="size-5" aria-hidden="true" />
                כניסה למנהלים
              </Link>
              <Link href="/kiosk-demo" className={buttonVariants({ variant: "secondary", size: "xl" })}>
                <TabletSmartphone className="size-5" aria-hidden="true" />
                צפייה במסך טאבלט
              </Link>
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-[2rem] opacity-40 blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(56,189,248,0.5) 0%, transparent 70%)" }}
                aria-hidden="true"
              />
              <div className="relative rounded-[2rem] border-4 border-white bg-white shadow-[0_40px_120px_rgba(15,39,66,0.25)] overflow-hidden w-[340px] sm:w-[400px]">
                <div className="flex items-center justify-between bg-brand px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="size-4 text-white" aria-hidden="true" />
                    <span className="text-sm font-bold text-white">CleanPulse</span>
                  </div>
                  <div className="size-2 rounded-full bg-white/40" aria-hidden="true" />
                </div>

                <div className="bg-[#f4faff] p-6 space-y-5 min-h-[340px]">
                  <p className="text-center text-lg font-bold text-foreground">כיצד נוכל לעזור?</p>
                  <div className="grid grid-cols-3 gap-3">
                    {tabletActions.map(({ icon: Icon, label }) => (
                      <button
                        key={label}
                        className="flex flex-col items-center gap-2.5 rounded-2xl border-2 border-brand/20 bg-white p-4 text-center shadow-soft hover:border-brand hover:bg-brand-soft transition-all"
                        tabIndex={-1}
                        type="button"
                      >
                        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
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

      <section id="solution" className="py-16 scroll-mt-20">
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

      <section id="resources" className="py-16 bg-white/50 scroll-mt-20">
        <div className="container-shell space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-bold text-brand">לוח בקרה</p>
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

              <div className="p-5 space-y-5 bg-[#f4faff]">
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

                <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
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

      <section id="pricing" className="py-20 border-t border-border scroll-mt-20 bg-gradient-to-b from-white to-[#f4faff]">
        <div className="container-shell space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <p className="text-sm font-bold text-brand">מסלולי שירות</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              מחירים פשוטים ושקופים לכל עסק
            </h2>
            <p className="text-muted text-base sm:text-lg">
              בחר את התוכנית המתאימה ביותר לצרכים של הארגון שלך. ללא התחייבות ארוכת טווח.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 items-stretch">
            <div className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-white p-8 shadow-soft hover:shadow-panel transition-all duration-300 relative overflow-hidden">
              <div className="space-y-4 flex-1">
                <h3 className="text-xl font-bold text-foreground">בסיסי</h3>
                <p className="text-sm text-muted">לסניפים בודדים שרוצים לשפר את הבקרות והשירות.</p>
                <div className="pt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-foreground">₪149</span>
                  <span className="text-sm font-semibold text-muted">/חודש</span>
                </div>
                <ul className="pt-6 space-y-3.5 text-sm">
                  {[
                    "סניף 1 פעיל",
                    "עד 3 אזורי שירותים (תאים)",
                    "התראות מייל מיידיות לנמענים",
                    "לוח בקרה בסיסי עם נתונים חיים",
                    "תמיכה במייל",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckCircle className="size-4 text-brand shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-8">
                <Link href="/login" className="w-full text-center py-3 rounded-xl border border-brand text-brand font-bold text-sm block hover:bg-brand hover:text-white transition-all">
                  התחל עכשיו
                </Link>
              </div>
            </div>

            <div className="flex flex-col rounded-[var(--radius-xl)] border-2 border-brand bg-white p-8 shadow-panel hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-brand text-white text-[11px] font-bold px-4 py-1.5 rounded-bl-xl">
                מומלץ
              </div>
              <div className="space-y-4 flex-1">
                <h3 className="text-xl font-bold text-foreground">מתקדם</h3>
                <p className="text-sm text-muted">לרשתות בינוניות ועסקים עם תנועה גבוהה.</p>
                <div className="pt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-foreground">₪299</span>
                  <span className="text-sm font-semibold text-muted">/חודש</span>
                </div>
                <ul className="pt-6 space-y-3.5 text-sm">
                  {[
                    "עד 5 סניפים פעילים",
                    "אזורי שירותים ללא הגבלה",
                    "התראות לפי הצורך לנמענים",
                    "דוחות ביצועים מתקדמים",
                    "ייצוא נתונים מלא ל-CSV",
                    "תמיכה טלפונית ועזרה בהקמה",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckCircle className="size-4 text-brand shrink-0 mt-0.5" />
                      <span className="text-foreground/90 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-8">
                <Link href="/login" className="w-full text-center py-3 rounded-xl bg-brand text-white font-bold text-sm block shadow-[0_4px_14px_rgba(30,136,229,0.35)] hover:bg-brand-deep transition-all">
                  התחל עכשיו
                </Link>
              </div>
            </div>

            <div className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-white p-8 shadow-soft hover:shadow-panel transition-all duration-300 relative overflow-hidden">
              <div className="space-y-4 flex-1">
                <h3 className="text-xl font-bold text-foreground">ארגוני</h3>
                <p className="text-sm text-muted">לקניונים, רשתות קמעונאיות ומרכזי קניות גדולים.</p>
                <div className="pt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-foreground">התאמה</span>
                  <span className="text-sm font-semibold text-muted">אישית</span>
                </div>
                <ul className="pt-6 space-y-3.5 text-sm">
                  {[
                    "סניפים ואזורים ללא הגבלה",
                    "חיבור למערכות קיימות לפי צורך",
                    "ליווי הקמה ותפעול",
                    "רמת שירות מוסכמת מראש",
                    "פיתוח דוחות והתאמות מיוחדות",
                    "חוזה שנתי מותאם אישית",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckCircle className="size-4 text-brand shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-8">
                <Link href="/login" className="w-full text-center py-3 rounded-xl border border-brand text-brand font-bold text-sm block hover:bg-brand hover:text-white transition-all">
                  צור קשר איתנו
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 border-t border-border scroll-mt-20 bg-white">
        <div className="container-shell grid gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-bold text-brand">שיחה קצרה</p>
              <h2 className="text-3xl font-extrabold text-foreground">נשמח לשמוע מכם</h2>
              <p className="text-muted text-sm leading-relaxed">
                רוצים לראות הדגמה חיה של המערכת, לשאול שאלות או להתחיל פיילוט ללא עלות? מלאו את הפרטים ונחזור אליכם בהקדם.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="form-name" className="text-xs font-bold text-muted pr-1">שם מלא</label>
                  <input
                    id="form-name"
                    type="text"
                    required
                    className="w-full border border-border p-3 rounded-xl text-sm bg-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    placeholder="ישראל ישראלי"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="form-company" className="text-xs font-bold text-muted pr-1">שם העסק / ארגון</label>
                  <input
                    id="form-company"
                    type="text"
                    required
                    className="w-full border border-border p-3 rounded-xl text-sm bg-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    placeholder="חברה בע&quot;מ"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="form-email" className="text-xs font-bold text-muted pr-1">כתובת אימייל</label>
                  <input
                    id="form-email"
                    type="email"
                    required
                    className="w-full border border-border p-3 rounded-xl text-sm bg-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="form-phone" className="text-xs font-bold text-muted pr-1">טלפון</label>
                  <input
                    id="form-phone"
                    type="tel"
                    required
                    className="w-full border border-border p-3 rounded-xl text-sm bg-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    placeholder="050-1234567"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="form-message" className="text-xs font-bold text-muted pr-1">כיצד נוכל לעזור?</label>
                <textarea
                  id="form-message"
                  rows={4}
                  required
                  className="w-full border border-border p-3 rounded-xl text-sm bg-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none"
                  placeholder="כתבו לנו כאן..."
                />
              </div>
              <button
                type="button"
                className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white shadow-soft hover:bg-brand-deep hover:shadow-panel transition-all text-center cursor-pointer"
              >
                שליחת פנייה
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-8 bg-[#f4faff] border border-border p-8 rounded-2xl">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-foreground">CleanPulse ישראל</h3>
              <p className="text-muted text-sm leading-relaxed">
                המערכת פותחה ומנוהלת בישראל על ידי צוות מומחי שירות וטכנולוגיה, במטרה להביא את בשורת הניקיון החכם לכל מרכז מסחרי, משרד ומוסד ציבורי.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand border border-brand/10">
                    <MailCheck className="size-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-muted">כתבו לנו</p>
                    <p className="text-sm font-bold text-foreground">sales@cleanpulse.co.il</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand border border-brand/10">
                    <Bell className="size-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-muted">התקשרו אלינו</p>
                    <p className="text-sm font-bold text-foreground">077-9876543</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand border border-brand/10">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-muted">המשרדים שלנו</p>
                    <p className="text-sm font-bold text-foreground">שדרות רוטשילד 22, תל אביב</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/60">
              <p className="text-xs font-bold text-brand mb-2">זמינות ורמת שירות</p>
              <p className="text-xs text-muted leading-relaxed">
                המערכת בנויה לעבודה רציפה בעסק, עם תמיכה מסודרת וליווי ללקוחות במסלולים המתקדמים.
              </p>
            </div>
          </div>
        </div>
      </section>

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
