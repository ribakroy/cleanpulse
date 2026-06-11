import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Droplets,
  Layers3,
  Lock,
  Mail,
  MapPinned,
  ScanLine,
  Send,
  ShieldCheck,
  Sparkles,
  TabletSmartphone,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BeforeAfterSlider } from "@/components/public/before-after-slider";

const navItems = [
  { label: "איך זה עובד", href: "#how" },
  { label: "למנהלים", href: "#managers" },
  { label: "דיווח מהיר", href: "#report" },
  { label: "מחירים", href: "#pricing" },
  { label: "צור קשר", href: "#contact" },
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

const closerItems = [
  {
    label: "סריקה ליד התא",
    title: "האורח שם לב. הצוות כבר יודע.",
    body: "דיווח קצר, ברור, בלי הורדה ובלי התחברות.",
    image: "/home/cp-qr-report.webp",
    alt: "סריקת QR ליד אזור שירותים נקי",
  },
  {
    label: "משימה לצוות",
    title: "פחות קריאות. יותר טיפול.",
    body: "המשימה מגיעה למי שצריך לראות אותה.",
    image: "/home/cp-staff-flow.webp",
    alt: "אשת צוות מקבלת משימת טיפול במסדרון שירותים נקי",
  },
  {
    label: "תמונת מצב",
    title: "מנהל רואה בלי לחפש.",
    body: "פתוח, בטיפול, נסגר. בשפה אחת.",
    image: "/home/cp-manager-dashboard.webp",
    alt: "דשבורד ניהול CleanPulse בסביבת עבודה יוקרתית",
  },
  {
    label: "סוף יום",
    title: "כל יום נסגר נקי.",
    body: "נוהל סגירה מחזיר את המקום להתחלה ברורה.",
    image: "/home/cp-closing.webp",
    alt: "טאבלט עם נוהל סגירה בסביבת שירותים נקייה",
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

const pricingPlans = [
  {
    name: "Starter",
    label: "למקום קטן",
    price: "₪99",
    period: "לחודש",
    body: "להתחיל מסודר עם מסכי דיווח בסיסיים.",
    features: ["עד 3 מסכים", "QR וטאבלט", "דיווחים פתוחים", "ניהול צוות בסיסי"],
    href: "/login",
  },
  {
    name: "Basic",
    label: "הכי נכון להתחלה",
    price: "₪199",
    period: "לחודש",
    body: "למקום פעיל שצריך תמונת מצב יומית.",
    features: ["עד 5 מסכים", "כמה אזורי שירותים", "דוחות תפעול", "נוהל סגירה"],
    href: "/login",
    featured: true,
  },
  {
    name: "Pro",
    label: "לרשת בצמיחה",
    price: "₪399",
    period: "לחודש",
    body: "לכמה נקודות, יותר צוותים ויותר בקרה.",
    features: ["עד 15 מסכים", "כמה סניפים", "מעקב מסכים", "ליווי התאמה"],
    href: "#contact",
  },
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

          <nav className="hidden items-center gap-5 text-sm font-extrabold text-muted md:flex lg:gap-8" aria-label="ניווט ראשי">
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

          <div className="container-shell relative z-10 grid min-h-[calc(100svh-9rem)] items-center gap-10 py-10 lg:grid-cols-[0.86fr_1.14fr]">
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

            <ProductMockupDeck />
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

        <section className="closer-section bg-white py-24 sm:py-32">
          <div className="container-shell space-y-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="section-label">מבט מקרוב</p>
                <h2 className="mt-4 text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
                  כל רגע קטן מקבל מקום ברור.
                </h2>
              </div>
              <p className="max-w-sm text-base font-bold leading-7 text-muted">
                ארבעה רגעים. אותה שפה. בלי להעמיס על האורח, הצוות או המנהל.
              </p>
            </div>

            <div className="closer-rail" aria-label="מבט מקרוב על CleanPulse">
              {closerItems.map((item, index) => (
                <article key={item.label} className="closer-card motion-card" style={{ animationDelay: `${index * 90}ms` }}>
                  <div className="closer-card-media">
                    <Image src={item.image} alt={item.alt} fill sizes="(max-width: 768px) 82vw, 36vw" className="object-cover" />
                  </div>
                  <div className="closer-card-copy">
                    <p>{item.label}</p>
                    <h3>{item.title}</h3>
                    <span>{item.body}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="before-after-section bg-[#f4faff] py-24 sm:py-32">
          <div className="container-shell space-y-10">
            <div className="mx-auto max-w-4xl text-center">
              <p className="section-label">לפני ואחרי</p>
              <h2 className="mt-4 text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
                רואים מיד כשמקום יוצא משליטה.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg font-bold leading-8 text-muted">
                אותו אזור. שני מצבים. דיווח קטן הופך רגע לא נעים למשימה ברורה.
              </p>
            </div>

            <BeforeAfterSlider
              beforeImage="/home/cp-before-dirty.webp"
              afterImage="/home/cp-before-clean.webp"
              beforeAlt="אזור שירותים לא נעים לפני טיפול"
              afterAlt="אותו אזור שירותים לאחר טיפול וניקיון"
            />
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
          visual={<QrScanMotion />}
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
              <ManagerOverlayMockup />
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

        <section id="pricing" className="pricing-section scroll-mt-24 bg-white py-24 sm:py-32">
          <div className="container-shell space-y-12">
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
              <div className="space-y-5">
                <p className="section-label">מחירים</p>
                <h2 className="text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
                  להתחיל קטן. לגדול נקי.
                </h2>
                <p className="max-w-xl text-lg font-bold leading-8 text-muted">
                  בחרו לפי כמות המסכים והסניפים. בלי חוזה כבד ובלי עודף מערכת.
                </p>
              </div>

              <div className="pricing-media-frame">
                <Image
                  src="/home/cp-pricing.webp"
                  alt="טאבלט עם תצוגת תוכניות CleanPulse בסביבת שירותים יוקרתית"
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="pricing-grid">
              {pricingPlans.map((plan) => (
                <article key={plan.name} className={`pricing-plan motion-card ${plan.featured ? "pricing-plan-featured" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-extrabold text-brand">{plan.label}</p>
                      <h3 className="mt-2 text-2xl font-extrabold text-brand-deep">{plan.name}</h3>
                    </div>
                    {plan.featured ? (
                      <span className="pricing-badge">
                        <Sparkles className="size-4" aria-hidden="true" />
                        מומלץ
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-8 flex items-end gap-2 text-brand-deep">
                    <span className="font-heading text-5xl font-extrabold leading-none">{plan.price}</span>
                    <span className="pb-1 text-sm font-extrabold text-muted">{plan.period}</span>
                  </p>
                  <p className="mt-5 min-h-14 text-base font-bold leading-7 text-muted">{plan.body}</p>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm font-extrabold text-brand-deep">
                        <CheckCircle2 className="size-5 shrink-0 text-brand" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.href} className={`mt-9 ${buttonVariants({ variant: plan.featured ? "primary" : "secondary", size: "lg", fullWidth: true })}`}>
                    {plan.featured ? "להתחיל" : "לבדוק התאמה"}
                    <ArrowLeft className="size-5" aria-hidden="true" />
                  </Link>
                </article>
              ))}
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

        <section id="contact" className="final-photo-cta scroll-mt-24">
          <Image src="/home/cp-contact.webp" alt="מנהל תפעול עם טאבלט ליד אזור שירותים יוקרתי" fill sizes="100vw" className="object-cover" />
          <div className="final-photo-overlay" aria-hidden="true" />
          <div className="container-shell relative z-10 grid gap-10 py-24 text-white lg:grid-cols-[1fr_26rem] lg:items-end sm:py-32">
            <div className="max-w-3xl space-y-6">
              <p className="text-sm font-extrabold text-brand-water">צור קשר</p>
              <h2 className="text-balance font-heading text-4xl font-extrabold leading-tight sm:text-6xl">
                בואו לראות את המקום שלכם עובד בשקט.
              </h2>
              <p className="max-w-2xl text-lg font-bold leading-8 text-white/76">
                דמו קצר, התאמה לפי מספר הסניפים, והבנה מה צריך כדי להתחיל נקי.
              </p>
            </div>

            <div className="contact-panel">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-white text-brand-deep">
                  <CreditCard className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-white/58">דמו והתאמה</p>
                  <h3 className="text-2xl font-extrabold text-white">נתחיל מהמקום שלכם.</h3>
                </div>
              </div>

              <p className="mt-6 text-base font-bold leading-7 text-white/72">
                שלחו בקשה ונחזור עם הצעה קצרה לפי כמות מסכים, סניפים וצורת עבודה.
              </p>

              <Link
                href="mailto:roy.ribak@gmail.com?subject=CleanPulse%20-%20בקשה%20לדמו"
                className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-extrabold text-brand-deep shadow-[0_20px_48px_rgba(255,255,255,0.14)] hover:bg-[#f4faff]"
              >
                <Mail className="size-5" aria-hidden="true" />
                דברו איתנו
              </Link>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Link href="/kiosk-demo" className="contact-secondary-link">
                  צפייה בדמו
                  <ArrowLeft className="size-5" aria-hidden="true" />
                </Link>
                <Link href="/login" className="contact-secondary-link">
                  כניסה למערכת
                  <Lock className="size-5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ProductMockupDeck() {
  return (
    <div className="product-mockup-deck home-reveal" aria-hidden="true">
      <div className="mockup-glow" />
      <div className="mockup-tablet home-float-slow">
        <div className="mockup-topbar">
          <span />
          <span />
          <span />
        </div>
        <div className="mockup-screen">
          <div className="mockup-screen-header">
            <span>CleanPulse</span>
            <strong>עכשיו</strong>
          </div>
          <div className="mockup-kpis">
            <span>3 פתוחים</span>
            <span>8 טופלו</span>
            <span>100% מסכים</span>
          </div>
          <div className="mockup-task mockup-task-active">
            <span />
            <div>
              <strong>קומה 2</strong>
              <p>נייר חסר בתא 4</p>
            </div>
            <em>בטיפול</em>
          </div>
          <div className="mockup-task">
            <span />
            <div>
              <strong>לובי</strong>
              <p>בדיקה לפני עומס</p>
            </div>
            <em>חדש</em>
          </div>
        </div>
      </div>

      <div className="mockup-phone home-float">
        <div className="mockup-phone-speaker" />
        <div className="mockup-phone-qr">
          <ScanLine className="size-8" aria-hidden="true" />
        </div>
        <p>דיווח נשלח</p>
      </div>

      <div className="mockup-alert home-float-reverse">
        <CheckCircle2 className="size-5 text-brand" aria-hidden="true" />
        <span>המשימה נסגרה</span>
      </div>
    </div>
  );
}

function ManagerOverlayMockup() {
  return (
    <div className="manager-overlay-mockup" aria-hidden="true">
      <div>
        <p>תמונת מצב</p>
        <strong>12:42</strong>
      </div>
      <div className="manager-overlay-row">
        <span />
        <em>ניקיון</em>
        <b>נסגר</b>
      </div>
      <div className="manager-overlay-row">
        <span />
        <em>ציוד</em>
        <b>בטיפול</b>
      </div>
      <div className="manager-overlay-send">
        <Send className="size-4" aria-hidden="true" />
        צוות עודכן
      </div>
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
  visual,
  reverse = false,
}: {
  id?: string;
  label: string;
  title: string;
  body: string;
  image: string;
  alt: string;
  cta?: { label: string; href: string };
  visual?: ReactNode;
  reverse?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-24 bg-white py-24 sm:py-32">
      <div className={`container-shell grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div className="premium-media-frame aspect-[16/10]">
          <Image src={image} alt={alt} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
          {visual}
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

function QrScanMotion() {
  return (
    <div className="qr-scan-motion" aria-hidden="true">
      <div className="qr-scan-card">
        <ScanLine className="size-7" />
        <span>סריקה נקייה</span>
      </div>
      <div className="qr-scan-beam" />
      <div className="soap-bubble soap-bubble-1" />
      <div className="soap-bubble soap-bubble-2" />
      <div className="soap-bubble soap-bubble-3" />
      <div className="soap-bubble soap-bubble-4" />
      <div className="soap-bubble soap-bubble-5" />
    </div>
  );
}
