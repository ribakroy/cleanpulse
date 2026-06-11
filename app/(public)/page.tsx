import Image from "next/image";
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
  TabletSmartphone,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const navItems = [
  { label: "איך זה עובד", href: "#how" },
  { label: "למנהלים", href: "#managers" },
  { label: "דיווח מהיר", href: "#report" },
];

const highlights = [
  {
    title: "דיווח בשנייה",
    body: "סריקה. בחירה. הצוות יודע.",
    image: "/home/cp-qr-report.webp",
    icon: ScanLine,
  },
  {
    title: "טיפול בלי בלבול",
    body: "כל משימה מגיעה למקום הנכון.",
    image: "/home/cp-staff-flow.webp",
    icon: ClipboardCheck,
  },
  {
    title: "שליטה מכל מקום",
    body: "מה פתוח. מה נסגר. ברור.",
    image: "/home/cp-manager-dashboard.webp",
    icon: MapPinned,
  },
];

const storySteps = [
  {
    number: "01",
    title: "האורח מדווח.",
    body: "QR או טאבלט. בלי אפליקציה. בלי התחברות.",
    image: "/home/cp-qr-report.webp",
    alt: "אורח סורק QR ליד עמדת דיווח נקייה",
  },
  {
    number: "02",
    title: "הצוות מטפל.",
    body: "המשימה מופיעה ברגע הנכון, במקום הנכון.",
    image: "/home/cp-staff-flow.webp",
    alt: "אשת צוות מקבלת משימת טיפול במסדרון שירותים נקי",
  },
  {
    number: "03",
    title: "המנהל רואה.",
    body: "דשבורד שקט. תמונת מצב בלי רעש.",
    image: "/home/cp-manager-dashboard.webp",
    alt: "מסך ניהול נקי עם דשבורד תפעולי",
  },
];

const managerPoints = ["מה פתוח.", "איפה זה קרה.", "מי טיפל.", "מה נסגר."];

const scaleItems: Array<{ label: string; icon: LucideIcon }> = [
  { label: "סניפים", icon: Building2 },
  { label: "אזורי שירותים", icon: Layers3 },
  { label: "צוותים", icon: UsersRound },
  { label: "מסכי דיווח", icon: TabletSmartphone },
];

const trustItems = [
  { title: "כל דיווח נשמר", icon: ClipboardCheck },
  { title: "כל טיפול מתועד", icon: CheckCircle2 },
  { title: "כל מסך במעקב", icon: ShieldCheck },
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/70 bg-white/72 backdrop-blur-2xl">
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
        <section className="hero-photo-section">
          <Image
            src="/home/cp-hero-cinematic.webp"
            alt="כניסה יוקרתית לאזור שירותים עם עמדת דיווח CleanPulse"
            fill
            priority
            sizes="100vw"
            className="object-cover object-left md:object-center"
          />
          <div className="hero-photo-wash" aria-hidden="true" />
          <div className="hero-photo-vignette" aria-hidden="true" />

          <div className="container-shell relative z-10 grid min-h-[calc(100svh-9rem)] items-center py-10">
            <div className="home-reveal max-w-2xl space-y-7">
              <h1 className="text-balance font-heading text-5xl font-extrabold leading-[1.03] text-brand-deep sm:text-6xl lg:text-7xl">
                שירותים שמרגישים מטופלים.
              </h1>
              <p className="max-w-xl text-lg font-bold leading-8 text-slate-700 sm:text-xl">
                CleanPulse מחבר בין מי שמדווח, מי שמטפל ומי שמנהל. בלי רעש, בלי ניירת, בלי פספוסים.
              </p>

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

              <div className="hero-proof-strip" aria-label="תקציר יכולות">
                {["דיווח קטן.", "טיפול ברור.", "ניהול שקט."].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="scroll-mt-24 bg-white py-16 sm:py-20">
          <div className="container-shell">
            <div className="grid gap-5 md:grid-cols-3">
              {highlights.map(({ icon: Icon, title, body, image }, index) => (
                <article key={title} className="highlight-photo-card home-rise" style={{ animationDelay: `${index * 90}ms` }}>
                  <div className="highlight-photo-media">
                    <Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  </div>
                  <div className="p-6">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-[#f4faff] text-brand">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h2 className="mt-5 text-2xl font-extrabold text-brand-deep">{title}</h2>
                    <p className="mt-2 text-base font-bold text-muted">{body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f4faff] py-24 sm:py-32">
          <div className="container-shell space-y-14">
            <div className="mx-auto max-w-4xl text-center">
              <p className="section-label">מה משתנה ברגע</p>
              <h2 className="mt-4 text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
                מהאורח הראשון ועד נוהל הסגירה.
              </h2>
            </div>

            <div className="story-photo-grid">
              {storySteps.map((step) => (
                <article key={step.number} className="story-photo-panel">
                  <Image src={step.image} alt={step.alt} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
                  <div className="story-photo-scrim" aria-hidden="true" />
                  <div className="story-photo-copy">
                    <p className="text-sm font-extrabold text-brand-water">{step.number}</p>
                    <h3 className="mt-4 text-3xl font-extrabold leading-tight text-white">{step.title}</h3>
                    <p className="mt-3 text-base font-bold leading-7 text-white/78">{step.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <ImageStorySection
          id="report"
          label="דיווח מהיר"
          title="דיווח שמרגיש טבעי."
          body="אין אפליקציה. אין התחברות. רק סריקה, בחירה ותודה."
          image="/home/cp-qr-report.webp"
          alt="סריקת QR ליד עמדת שירותים יוקרתית"
          cta={{ label: "נסה מסך דוגמה", href: "/kiosk-demo" }}
        />

        <section id="managers" className="scroll-mt-24 bg-[linear-gradient(180deg,#f4faff_0%,#ffffff_100%)] py-24 sm:py-32">
          <div className="container-shell grid gap-12 lg:grid-cols-[0.84fr_1.16fr] lg:items-center">
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

            <div className="premium-media-frame aspect-[16/10]">
              <Image
                src="/home/cp-manager-dashboard.webp"
                alt="מסך דשבורד ניהולי בסביבה תפעולית יוקרתית"
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <ImageStorySection
          label="נוהל סגירה"
          title="בסוף היום, הכל חוזר לנקודת התחלה."
          body="אפשר לאפס פניות אחרי בדיקה מלאה, או להשאיר אותן להמשך טיפול לפי הדרך שבה העסק עובד."
          image="/home/cp-closing.webp"
          alt="נוהל סגירה על טאבלט במסדרון שירותים נקי"
          reverse
        />

        <section className="bg-[#f4faff] py-24 sm:py-32">
          <div className="container-shell grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div className="space-y-7">
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

            <div className="premium-media-frame aspect-[16/10]">
              <Image
                src="/home/cp-scale-network.webp"
                alt="רשת סניפים עם נקודות שירות מחוברות"
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden bg-white py-24 sm:py-32">
          <div className="absolute inset-x-0 top-0 h-1/2 bg-[#f4faff]" aria-hidden="true" />
          <div className="container-shell relative z-10 space-y-12">
            <div className="premium-media-frame mx-auto aspect-[16/7] max-w-6xl">
              <Image
                src="/home/cp-trust.webp"
                alt="אזור שירותים נקי עם סימני אמון ובקרה"
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="trust-image-overlay" aria-hidden="true" />
            </div>

            <div className="mx-auto max-w-4xl text-center">
              <p className="section-label">אמון</p>
              <h2 className="mt-4 text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
                פחות רעש. יותר ודאות.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {trustItems.map(({ icon: Icon, title }) => (
                <article key={title} className="trust-panel">
                  <Icon className="size-7 text-brand" aria-hidden="true" />
                  <h3 className="mt-8 text-2xl font-extrabold text-brand-deep">{title}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="final-photo-cta">
          <Image src="/home/cp-trust.webp" alt="" fill sizes="100vw" className="object-cover" />
          <div className="final-photo-overlay" aria-hidden="true" />
          <div className="container-shell relative z-10 grid gap-10 py-24 text-white lg:grid-cols-[1fr_auto] lg:items-end sm:py-32">
            <div className="max-w-3xl space-y-6">
              <h2 className="text-balance font-heading text-4xl font-extrabold leading-tight sm:text-6xl">
                להתחיל לראות מה באמת קורה.
              </h2>
              <p className="max-w-2xl text-lg font-bold leading-8 text-white/76">
                תנו לצוות לטפל בזמן. תנו למנהלים שקט.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-extrabold text-brand-deep shadow-[0_20px_48px_rgba(255,255,255,0.14)] hover:bg-[#f4faff]">
                כניסה למערכת
              </Link>
              <Link href="/kiosk-demo" className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 text-base font-extrabold text-white backdrop-blur-xl hover:bg-white/16">
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

function ImageStorySection({
  id,
  label,
  title,
  body,
  image,
  alt,
  cta,
  reverse = false,
}: {
  id?: string;
  label: string;
  title: string;
  body: string;
  image: string;
  alt: string;
  cta?: { label: string; href: string };
  reverse?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-24 bg-white py-24 sm:py-32">
      <div className={`container-shell grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div className="premium-media-frame aspect-[16/10]">
          <Image src={image} alt={alt} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
        </div>

        <div className="space-y-6">
          <p className="section-label">{label}</p>
          <h2 className="text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
            {title}
          </h2>
          <p className="max-w-xl text-lg font-bold leading-8 text-muted">{body}</p>
          {cta ? (
            <Link href={cta.href} className={buttonVariants({ variant: "secondary", size: "xl" })}>
              {cta.label}
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
