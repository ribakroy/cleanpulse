import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Bell,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Clock3,
  Droplets,
  Gem,
  Lock,
  MailCheck,
  ScanLine,
  ShieldCheck,
  Star,
  TabletSmartphone,
  TimerReset,
  TrendingUp,
  UsersRound,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const heroMetrics = [
  { label: "דיווחים מטופלים", value: "1,248", detail: "בחודש האחרון" },
  { label: "זמן תגובה", value: "18 דק׳", detail: "ממוצע טיפול" },
  { label: "שביעות רצון", value: "4.8/5", detail: "מהלקוחות" },
];

const flowSteps = [
  {
    icon: ScanLine,
    title: "הלקוח מדווח בשנייה",
    body: "טאבלט בכניסה או QR ליד התא. בלי טפסים ארוכים, בלי חיכוך, בלי בלבול.",
  },
  {
    icon: Bell,
    title: "הצוות מקבל התראה",
    body: "הפנייה מגיעה לנמען הנכון עם מיקום, סוג הבעיה ורמת הדחיפות.",
  },
  {
    icon: ClipboardCheck,
    title: "הטיפול נסגר ומתועד",
    body: "כל פעולה נרשמת, הדשבורד מתעדכן, והעסק מבין איפה צריך להשתפר.",
  },
];

const featureCards = [
  {
    icon: TabletSmartphone,
    title: "חוויה ציבורית שנראית מצוין",
    body: "מסך טאבלט ו־QR שנראים כמו חלק מהעסק, לא כמו טופס פנימי.",
    accent: "from-sky-100 to-white",
  },
  {
    icon: TimerReset,
    title: "איפוס סוף יום חכם",
    body: "סגירת פניות פתוחות לפי נוהל העסק, בלי עבודה ידנית מיותרת.",
    accent: "from-emerald-100 to-white",
  },
  {
    icon: TrendingUp,
    title: "תובנות שעוזרות לנהל",
    body: "איפה חוזרות בעיות, מי מטפל מהר, ומה דורש שינוי תפעולי.",
    accent: "from-indigo-100 to-white",
  },
];

const liveMetrics = [
  { label: "פתוחים עכשיו", value: "14", tone: "text-red-600", icon: AlertTriangle },
  { label: "טופלו היום", value: "47", tone: "text-emerald-600", icon: CheckCircle2 },
  { label: "תגובה ממוצעת", value: "18 דק׳", tone: "text-brand", icon: Clock3 },
  { label: "מסכים פעילים", value: "22", tone: "text-brand-deep", icon: Activity },
];

const mockIncidents = [
  { title: "חסר נייר", location: "קניון עזריאלי · קומה 2", status: "פתוח", tone: "bg-red-50 text-red-700 border-red-100" },
  { title: "ציון כללי 2/5", location: "משרדי HQ · אזור אורחים", status: "בטיפול", tone: "bg-amber-50 text-amber-700 border-amber-100" },
  { title: "ריח לא נעים", location: "בית קפה רוטשילד · קומה 1", status: "נסגר", tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
];

const chartBars = [42, 66, 54, 82, 74, 92, 63, 78, 58, 88];

const industryCards = [
  { icon: Building2, title: "קניונים ומרכזים מסחריים", body: "עומסים גבוהים, הרבה אזורים, צורך בתגובה מיידית." },
  { icon: UsersRound, title: "משרדים וחברות", body: "חוויה נקייה לעובדים, אורחים ומנהלים בכל שעות היום." },
  { icon: Star, title: "בתי קפה ומסעדות", body: "כל ביקור בשירותים משפיע על תחושת המותג." },
];

const pricingPlans = [
  {
    title: "בסיסי",
    description: "לעסק אחד שרוצה להתחיל לנהל שירותים בצורה חכמה.",
    price: "₪149",
    features: ["סניף אחד", "עד 3 אזורי שירותים", "QR וטאבלט", "התראות מייל", "דשבורד בסיסי"],
    cta: "התחלה מהירה",
    highlighted: false,
  },
  {
    title: "מתקדם",
    description: "לרשתות ועסקים עם תנועה גבוהה ויותר נקודות שירות.",
    price: "₪299",
    features: ["עד 5 סניפים", "אזורי שירותים ללא הגבלה", "דוחות מלאים", "CSV", "ליווי הקמה"],
    cta: "המסלול המומלץ",
    highlighted: true,
  },
  {
    title: "ארגוני",
    description: "לקניונים, מוסדות ורשתות עם צרכים תפעוליים מורכבים.",
    price: "מותאם",
    features: ["סניפים ללא הגבלה", "התאמות תפעול", "דוחות מותאמים", "תמיכה מורחבת", "תהליך הטמעה"],
    cta: "שיחת התאמה",
    highlighted: false,
  },
];

const trustItems = [
  { icon: Lock, text: "גישה מאובטחת" },
  { icon: ShieldCheck, text: "הרשאות לפי תפקיד" },
  { icon: Zap, text: "הטמעה מהירה" },
  { icon: MailCheck, text: "התראות מסודרות" },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden bg-[#f4faff] text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/70 bg-white/78 backdrop-blur-xl">
        <div className="container-shell flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-brand shadow-[0_10px_24px_rgba(30,136,229,0.25)]">
              <Droplets className="size-4 text-white" aria-hidden="true" />
            </span>
            <span className="text-lg font-extrabold text-foreground">CleanPulse</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-muted md:flex">
            {[
              { label: "איך זה עובד", href: "#flow" },
              { label: "לוח בקרה", href: "#dashboard" },
              { label: "למי זה מתאים", href: "#industries" },
              { label: "מסלולים", href: "#pricing" },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="hover:text-brand-deep">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/kiosk-demo"
              className="hidden h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-muted hover:bg-brand-soft hover:text-brand-deep sm:inline-flex"
            >
              <TabletSmartphone className="size-4" aria-hidden="true" />
              הדגמת טאבלט
            </Link>
            <Link href="/login" className={buttonVariants({ variant: "primary", size: "sm" })}>
              <Lock className="size-4" aria-hidden="true" />
              <span className="sm:hidden">כניסה</span>
              <span className="hidden sm:inline">כניסה למנהלים</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden border-b border-white/70">
          <Image
            src="/home/cleanpulse-hero.png"
            alt="מסך CleanPulse בכניסה לאזור שירותים נקי עם QR ולוח בקרה צף"
            fill
            priority
            sizes="100vw"
            className="z-0 object-cover object-left md:object-center"
          />
          <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(244,250,255,0.18)_0%,rgba(244,250,255,0.62)_42%,rgba(244,250,255,0.96)_72%,#f4faff_100%)]" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-[#f4faff] to-transparent" aria-hidden="true" />

          <div className="container-shell relative z-20 flex min-h-[calc(100svh-4rem)] items-center py-14">
            <div className="w-full max-w-2xl space-y-8 home-reveal">
              <div className="space-y-5">
                <h1 className="text-balance font-heading text-5xl font-extrabold leading-[1.05] text-brand-deep sm:text-6xl lg:text-7xl">
                  CleanPulse
                </h1>
                <p className="max-w-xl text-2xl font-extrabold leading-9 text-brand sm:text-3xl">
                  ניהול ניקיון בזמן אמת שמרגיש כמו שירות פרימיום.
                </p>
                <p className="max-w-xl text-lg font-medium leading-8 text-slate-700 sm:text-xl">
                  לקוחות מדווחים בשנייה. הצוות מקבל התראה ברורה. המנהל רואה מה דורש טיפול, מה נסגר, ואיפה העסק יכול להשתפר.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/login" className={buttonVariants({ variant: "primary", size: "xl" })}>
                  <Lock className="size-5" aria-hidden="true" />
                  כניסה למנהלים
                </Link>
                <Link href="/kiosk-demo" className={buttonVariants({ variant: "secondary", size: "xl" })}>
                  <TabletSmartphone className="size-5" aria-hidden="true" />
                  צפייה במסך טאבלט
                </Link>
              </div>

              <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
                {heroMetrics.map((metric, index) => (
                  <div
                    key={metric.label}
                    className="home-rise rounded-[var(--radius-lg)] border border-white/70 bg-white/72 p-4 shadow-soft backdrop-blur-xl"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <p className="text-xs font-bold text-muted">{metric.label}</p>
                    <p className="mt-1 text-2xl font-extrabold text-brand-deep">{metric.value}</p>
                    <p className="mt-1 text-xs font-semibold text-brand">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="flow" className="scroll-mt-20 bg-[#f4faff] py-20">
          <div className="container-shell space-y-12">
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div className="space-y-4">
                <p className="text-sm font-extrabold text-brand">מהרגע שמישהו נכנס לשירותים</p>
                <h2 className="text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-5xl">
                  סוף סוף יש לך מערכת שמראה מה קורה באמת.
                </h2>
              </div>
              <p className="max-w-2xl text-lg font-medium leading-8 text-muted">
                CleanPulse מחבר בין הלקוח, צוות הניקיון והניהול. במקום תלונות מפוזרות, יש זרימה אחת פשוטה שמובילה לטיפול מהיר ולשיפור עקבי.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {flowSteps.map(({ icon: Icon, title, body }, index) => (
                <div
                  key={title}
                  className="home-card-lift group relative min-h-[260px] overflow-hidden rounded-[var(--radius-xl)] border border-white/80 bg-white p-7 shadow-soft"
                >
                  <div className="absolute inset-x-7 top-7 h-px bg-gradient-to-l from-brand via-brand-water to-transparent opacity-50" aria-hidden="true" />
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand shadow-soft">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <div className="mt-9 space-y-3">
                    <p className="text-sm font-extrabold text-brand">0{index + 1}</p>
                    <h3 className="text-2xl font-extrabold text-brand-deep">{title}</h3>
                    <p className="text-base font-medium leading-8 text-muted">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="dashboard" className="scroll-mt-20 border-y border-border bg-white py-20">
          <div className="container-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="space-y-7">
              <div className="space-y-4">
                <p className="text-sm font-extrabold text-brand">לוח בקרה חי</p>
                <h2 className="text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-5xl">
                  מנהל נכנס ומבין תוך עשר שניות מה דורש טיפול.
                </h2>
                <p className="text-lg font-medium leading-8 text-muted">
                  לא טבלה טכנית. לא עומס. רק תמונת מצב ברורה: מה פתוח, איפה זה נמצא, מי צריך להגיב ומה כבר נסגר.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {featureCards.map(({ icon: Icon, title, body, accent }) => (
                  <div key={title} className={`rounded-[var(--radius-lg)] border border-border bg-gradient-to-br ${accent} p-5 shadow-soft`}>
                    <Icon className="size-6 text-brand" aria-hidden="true" />
                    <h3 className="mt-4 text-lg font-extrabold text-brand-deep">{title}</h3>
                    <p className="mt-2 text-sm font-medium leading-7 text-muted">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="home-dashboard-shell overflow-hidden rounded-[1.6rem] border border-border bg-[#f4faff] shadow-panel">
                <div className="flex items-center justify-between border-b border-border bg-white px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white">
                      <Droplets className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-brand-deep">סקירה כללית</p>
                      <p className="text-xs font-semibold text-muted">קפה דמו · מצב פעיל</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    מחובר
                  </span>
                </div>

                <div className="space-y-5 p-5">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {liveMetrics.map(({ icon: Icon, label, value, tone }) => (
                      <div key={label} className="rounded-2xl border border-border bg-white p-4 shadow-soft">
                        <div className="flex items-center justify-between gap-2">
                          <Icon className={`size-5 ${tone}`} aria-hidden="true" />
                          <p className="text-[11px] font-bold text-muted">{label}</p>
                        </div>
                        <p className={`mt-3 text-2xl font-extrabold ${tone}`}>{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
                      <div className="mb-5 flex items-center justify-between">
                        <p className="text-sm font-extrabold text-brand-deep">דיווחים לפי ימים</p>
                        <span className="text-xs font-bold text-brand">+12%</span>
                      </div>
                      <div className="flex h-36 items-end gap-2">
                        {chartBars.map((height, index) => (
                          <div key={index} className="flex flex-1 flex-col items-center gap-2">
                            <div className="relative w-full overflow-hidden rounded-t-xl bg-brand-soft">
                              <div
                                className="home-bar w-full rounded-t-xl bg-gradient-to-t from-brand to-brand-water"
                                style={{ height: `${height}%`, animationDelay: `${index * 80}ms` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
                      <p className="mb-4 text-sm font-extrabold text-brand-deep">דיווחים אחרונים</p>
                      <div className="space-y-3">
                        {mockIncidents.map((incident) => (
                          <div key={incident.title} className="rounded-xl border border-border bg-white p-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-extrabold text-brand-deep">{incident.title}</p>
                              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${incident.tone}`}>
                                {incident.status}
                              </span>
                            </div>
                            <p className="mt-2 text-xs font-semibold text-muted">{incident.location}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="home-floating-card absolute -bottom-8 right-5 hidden w-64 rounded-2xl border border-white bg-white/88 p-4 shadow-panel backdrop-blur-xl lg:block">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-brand-deep">איפוס סוף יום בוצע</p>
                    <p className="text-xs font-semibold text-muted">נסגרו 8 פניות פתוחות</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="industries" className="scroll-mt-20 bg-[#f4faff] py-20">
          <div className="container-shell space-y-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-extrabold text-brand">מי מרוויח מזה</p>
              <h2 className="mt-3 font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-5xl">
                כל מקום שבו שירותים נקיים משפיעים על העסק.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {industryCards.map(({ icon: Icon, title, body }) => (
                <div key={title} className="home-card-lift rounded-[var(--radius-xl)] border border-white/80 bg-white p-7 shadow-soft">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold text-brand-deep">{title}</h3>
                  <p className="mt-3 text-base font-medium leading-8 text-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-20 border-y border-border bg-white py-20">
          <div className="container-shell space-y-12">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-extrabold text-brand">מסלולי שירות</p>
              <h2 className="mt-3 font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-5xl">
                מתחילים קטן, נראים כמו מוצר גדול מהיום הראשון.
              </h2>
              <p className="mt-4 text-lg font-medium leading-8 text-muted">
                מחירים פשוטים, בלי מערכת כבדה ובלי חודשים של הטמעה.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.title}
                  className={`relative flex min-h-[520px] flex-col overflow-hidden rounded-[var(--radius-xl)] border p-8 shadow-soft ${
                    plan.highlighted
                      ? "border-brand bg-[linear-gradient(180deg,#ffffff_0%,#f4faff_100%)] shadow-panel"
                      : "border-border bg-white"
                  }`}
                >
                  {plan.highlighted ? (
                    <span className="absolute left-6 top-6 rounded-full bg-brand px-4 py-1.5 text-xs font-extrabold text-white">
                      הכי מתאים לרוב העסקים
                    </span>
                  ) : null}

                  <div className="flex-1 pt-10">
                    <Gem className="size-7 text-brand" aria-hidden="true" />
                    <h3 className="mt-5 text-2xl font-extrabold text-brand-deep">{plan.title}</h3>
                    <p className="mt-3 min-h-[56px] text-sm font-medium leading-7 text-muted">{plan.description}</p>
                    <div className="mt-7 flex items-end gap-2">
                      <span className="text-5xl font-extrabold text-brand-deep">{plan.price}</span>
                      {plan.price.startsWith("₪") ? <span className="pb-2 text-sm font-bold text-muted">לחודש</span> : null}
                    </div>
                    <ul className="mt-8 space-y-3 text-sm font-semibold text-foreground/85">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href="/login"
                    className={`mt-8 flex h-12 items-center justify-center rounded-full text-sm font-extrabold ${
                      plan.highlighted
                        ? "bg-brand text-white shadow-[0_14px_30px_rgba(30,136,229,0.2)] hover:bg-brand-deep"
                        : "border border-brand/25 text-brand hover:bg-brand hover:text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-20 bg-[#f4faff] py-20">
          <div className="container-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="space-y-6">
              <p className="text-sm font-extrabold text-brand">שיחה קצרה</p>
              <h2 className="font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-5xl">
                רוצים לראות איך זה נראה בעסק שלכם?
              </h2>
              <p className="text-lg font-medium leading-8 text-muted">
                נבנה לכם הדגמה קצרה עם סניפים, אזורים ותסריטי דיווח אמיתיים מהשטח. תוך כמה דקות אפשר להבין אם זה מתאים.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {trustItems.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 rounded-2xl border border-white bg-white/78 p-4 shadow-soft">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-extrabold text-brand-deep">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-white bg-white p-6 shadow-panel sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-brand-deep" htmlFor="form-name">
                  שם מלא
                  <input id="form-name" className="h-12 rounded-xl border border-border bg-white px-4 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" placeholder="ישראל ישראלי" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-brand-deep" htmlFor="form-company">
                  שם העסק
                  <input id="form-company" className="h-12 rounded-xl border border-border bg-white px-4 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" placeholder="קניון / משרד / בית קפה" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-brand-deep" htmlFor="form-email">
                  אימייל
                  <input id="form-email" type="email" className="h-12 rounded-xl border border-border bg-white px-4 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" placeholder="email@example.com" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-brand-deep" htmlFor="form-phone">
                  טלפון
                  <input id="form-phone" type="tel" className="h-12 rounded-xl border border-border bg-white px-4 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" placeholder="050-1234567" />
                </label>
              </div>
              <label className="mt-4 grid gap-2 text-sm font-bold text-brand-deep" htmlFor="form-message">
                מה חשוב לכם לשפר?
                <textarea
                  id="form-message"
                  rows={5}
                  className="resize-none rounded-xl border border-border bg-white px-4 py-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                  placeholder="לדוגמה: דיווחי QR, זמני תגובה, דוחות למנהל אזור..."
                />
              </label>
              <a
                href="mailto:sales@cleanpulse.co.il?subject=%D7%91%D7%A7%D7%A9%D7%AA%20%D7%94%D7%93%D7%92%D7%9E%D7%94%20%D7%9C-CleanPulse"
                className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand px-6 text-base font-extrabold text-white shadow-[0_14px_30px_rgba(30,136,229,0.2)] hover:bg-brand-deep"
              >
                שליחת פנייה
                <ChevronLeft className="size-5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="bg-brand-deep py-12 text-white">
          <div className="container-shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-extrabold">CleanPulse</p>
              <p className="mt-1 text-sm font-medium text-white/70">ניקיון ציבורי שמנוהל כמו מוצר פרימיום.</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-bold text-white/78">
              <span>sales@cleanpulse.co.il</span>
              <span>077-9876543</span>
              <span>תל אביב</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
