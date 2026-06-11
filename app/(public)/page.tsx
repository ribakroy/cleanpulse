import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Droplets,
  Layers3,
  Lock,
  MapPinned,
  ScanLine,
  ShieldCheck,
  Sparkles,
  TabletSmartphone,
  type LucideIcon,
  UsersRound,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  ClosingProcedureCard,
  DashboardPreview,
  HeroVisual,
  PhoneReportMockup,
  ScaleVisual,
  TabletReportMockup,
  WaterGlow,
} from "@/components/public/homepage-visuals";

const navItems = [
  { label: "איך זה עובד", href: "#how" },
  { label: "למנהלים", href: "#managers" },
  { label: "דיווח מהיר", href: "#report" },
];

const highlights = [
  {
    title: "דיווח בשנייה",
    body: "סריקה. בחירה. תודה.",
    icon: ScanLine,
  },
  {
    title: "טיפול בלי בלבול",
    body: "כל פנייה מגיעה למקום הנכון.",
    icon: ClipboardCheck,
  },
  {
    title: "שליטה מכל מקום",
    body: "פתוח, בטיפול, נסגר. ברור.",
    icon: MapPinned,
  },
];

const flowSteps = [
  {
    number: "01",
    title: "מישהו שם לב.",
    body: "האורח סורק QR או נוגע במסך. אין אפליקציה ואין התחברות.",
  },
  {
    number: "02",
    title: "הצוות כבר יודע.",
    body: "הדיווח מגיע עם מיקום וסוג טיפול, בלי שיחות ובלי ניחושים.",
  },
  {
    number: "03",
    title: "המנהל רואה תמונה.",
    body: "מה פתוח. מה נסגר. איפה חוזרת בעיה. הכל נקי וברור.",
  },
];

const managerPoints = ["מה פתוח.", "איפה זה קרה.", "מי טיפל.", "מה נסגר."];

const trustItems = [
  { title: "כל דיווח נשמר", icon: ClipboardCheck },
  { title: "כל טיפול מתועד", icon: CheckCircle2 },
  { title: "כל מסך במעקב", icon: ShieldCheck },
];

const scaleItems: Array<{ label: string; icon: LucideIcon }> = [
  { label: "סניפים", icon: Building2 },
  { label: "אזורי שירותים", icon: Layers3 },
  { label: "צוותים", icon: UsersRound },
  { label: "מסכי דיווח", icon: TabletSmartphone },
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/65 bg-white/76 backdrop-blur-2xl">
        <div className="container-shell flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="CleanPulse">
            <span className="flex size-9 items-center justify-center rounded-full bg-brand text-white shadow-[0_16px_36px_rgba(30,136,229,0.2)]">
              <Droplets className="size-4" aria-hidden="true" />
            </span>
            <span className="text-base font-extrabold tracking-normal text-brand-deep">CleanPulse</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-extrabold text-muted md:flex" aria-label="ניווט ראשי">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-brand-deep">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              כניסה
            </Link>
            <Link href="/kiosk-demo" className={buttonVariants({ variant: "primary", size: "sm" })}>
              <TabletSmartphone className="size-4" aria-hidden="true" />
              דמו
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f4faff_76%,#ffffff_100%)]">
          <WaterGlow className="-right-28 top-16 h-80 w-80" />
          <WaterGlow className="bottom-4 left-0 h-72 w-72" />
          <div className="container-shell grid min-h-[calc(100svh-14rem)] gap-8 pb-6 pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:pb-8 lg:pt-14">
            <div className="home-reveal max-w-2xl space-y-7">
              <div className="space-y-5">
                <h1 className="text-balance font-heading text-5xl font-extrabold leading-[1.04] text-brand-deep sm:text-6xl lg:text-7xl">
                  שקט תפעולי, בזמן אמת.
                </h1>
                <p className="max-w-xl text-lg font-bold leading-8 text-slate-700 sm:text-xl">
                  CleanPulse מחבר בין מי שמדווח, מי שמטפל ומי שמנהל. בלי רעש, בלי ניירת, בלי פספוסים.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/login" className={buttonVariants({ variant: "primary", size: "xl" })}>
                  <Lock className="size-5" aria-hidden="true" />
                  כניסה למערכת
                </Link>
                <Link href="/kiosk-demo" className={buttonVariants({ variant: "secondary", size: "xl" })}>
                  צפייה בדמו
                  <ArrowLeft className="size-5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <HeroVisual />
          </div>
        </section>

        <section id="how" className="scroll-mt-24 bg-white pb-24 pt-8">
          <div className="container-shell">
            <div className="grid gap-4 md:grid-cols-3">
              {highlights.map(({ icon: Icon, title, body }, index) => (
                <article
                  key={title}
                  className="home-rise rounded-[2rem] border border-[#d8ecfa] bg-white/88 p-6 shadow-soft"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#f4faff] text-brand">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h2 className="mt-6 text-2xl font-extrabold text-brand-deep">{title}</h2>
                  <p className="mt-2 text-base font-bold text-muted">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#f4faff] py-24 sm:py-32">
          <WaterGlow className="left-1/2 top-10 h-72 w-72 -translate-x-1/2" />
          <div className="container-shell space-y-14">
            <div className="mx-auto max-w-4xl text-center">
              <p className="section-label">מה משתנה ברגע</p>
              <h2 className="mt-4 text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
                מהאורח הראשון ועד נוהל הסגירה.
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {flowSteps.map((step) => (
                <article key={step.number} className="story-panel">
                  <p className="text-sm font-extrabold text-brand">{step.number}</p>
                  <h3 className="mt-8 text-3xl font-extrabold leading-tight text-brand-deep">{step.title}</h3>
                  <p className="mt-4 text-base font-bold leading-8 text-muted">{step.body}</p>
                </article>
              ))}
            </div>

            <div className="product-flow">
              <div className="product-flow-screen">
                <PhoneReportMockup />
              </div>
              <div className="product-flow-screen product-flow-screen-wide">
                <TabletReportMockup />
              </div>
              <div className="product-flow-screen">
                <div className="rounded-[2rem] bg-white p-5 shadow-soft">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-extrabold text-brand-deep">משימה לצוות</p>
                    <span className="rounded-full bg-brand px-3 py-1 text-xs font-extrabold text-white">בטיפול</span>
                  </div>
                  <div className="mt-8 space-y-3">
                    {["לובי ראשי", "נדרש ניקיון", "נשלח לאחראי משמרת"].map((item) => (
                      <div key={item} className="rounded-2xl bg-[#f4faff] px-4 py-3 text-sm font-extrabold text-brand-deep">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="report" className="overflow-hidden bg-white py-24 sm:py-32">
          <div className="container-shell grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="space-y-6">
              <p className="section-label">דיווח מהיר</p>
              <h2 className="text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
                דיווח שמרגיש טבעי.
              </h2>
              <div className="space-y-4 text-xl font-extrabold leading-9 text-brand-deep">
                <p>אין אפליקציה.</p>
                <p>אין התחברות.</p>
                <p>רק סריקה, בחירה ותודה.</p>
              </div>
              <Link href="/kiosk-demo" className={buttonVariants({ variant: "secondary", size: "xl" })}>
                נסה מסך דוגמה
                <ArrowLeft className="size-5" aria-hidden="true" />
              </Link>
            </div>

            <div className="qr-stage">
              <WaterGlow className="-left-10 top-8 h-64 w-64" />
              <div className="mx-auto max-w-sm">
                <PhoneReportMockup />
              </div>
              <div className="thank-you-card">
                <CheckCircle2 className="size-5 text-emerald-600" aria-hidden="true" />
                <span>תודה. הצוות קיבל.</span>
              </div>
            </div>
          </div>
        </section>

        <section id="managers" className="bg-[linear-gradient(180deg,#f4faff_0%,#ffffff_100%)] py-24 sm:py-32">
          <div className="container-shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div className="space-y-7">
              <p className="section-label">למנהלים</p>
              <h2 className="text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
                לראות בדיוק מה דורש טיפול.
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {managerPoints.map((point) => (
                  <div key={point} className="rounded-3xl border border-white bg-white/78 px-5 py-4 text-lg font-extrabold text-brand-deep shadow-soft">
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <DashboardPreview />
          </div>
        </section>

        <section className="overflow-hidden bg-white py-24 sm:py-32">
          <div className="container-shell grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <ClosingProcedureCard />
            <div className="space-y-6">
              <p className="section-label">נוהל סגירה</p>
              <h2 className="text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
                בסוף היום, הכל חוזר לנקודת התחלה.
              </h2>
              <p className="max-w-xl text-lg font-bold leading-8 text-muted">
                נוהל סגירה מאפשר לאפס פניות פתוחות אחרי בדיקה מלאה, או להשאיר אותן להמשך טיפול לפי הדרך שבה העסק עובד.
              </p>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#f4faff] py-24 sm:py-32">
          <div className="container-shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div className="space-y-6">
              <p className="section-label">מסניף לרשת</p>
              <h2 className="text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
                בנוי לצמוח מסניף אחד לרשת.
              </h2>
              <p className="max-w-xl text-lg font-bold leading-8 text-muted">
                סניפים, אזורי שירותים, מסכים ו־QR. אותו שקט, גם כשהעסק גדל.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {scaleItems.map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 rounded-3xl bg-white px-5 py-4 shadow-soft">
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-[#f4faff] text-brand">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-extrabold text-brand-deep">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <ScaleVisual />
          </div>
        </section>

        <section className="bg-white py-24 sm:py-32">
          <div className="container-shell">
            <div className="mx-auto max-w-4xl text-center">
              <p className="section-label">אמון</p>
              <h2 className="mt-4 text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
                פחות רעש. יותר ודאות.
              </h2>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {trustItems.map(({ icon: Icon, title }) => (
                <article key={title} className="trust-panel">
                  <Icon className="size-7 text-brand" aria-hidden="true" />
                  <h3 className="mt-8 text-2xl font-extrabold text-brand-deep">{title}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-brand-deep py-24 text-white sm:py-32">
          <WaterGlow className="-right-20 top-0 h-96 w-96 opacity-80" />
          <div className="container-shell relative z-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl space-y-6">
              <Sparkles className="size-8 text-brand-water" aria-hidden="true" />
              <h2 className="text-balance font-heading text-4xl font-extrabold leading-tight sm:text-6xl">
                להתחיל לראות מה באמת קורה.
              </h2>
              <p className="max-w-2xl text-lg font-bold leading-8 text-white/72">
                תנו לצוות לטפל בזמן. תנו למנהלים שקט.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-extrabold text-brand-deep shadow-[0_20px_48px_rgba(255,255,255,0.14)] hover:bg-[#f4faff]">
                כניסה למערכת
              </Link>
              <Link href="/kiosk-demo" className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/18 bg-white/8 px-7 text-base font-extrabold text-white backdrop-blur-xl hover:bg-white/14">
                צפייה בדמו
                <ArrowLeft className="size-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
