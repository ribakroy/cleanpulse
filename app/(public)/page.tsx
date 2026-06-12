import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Droplets,
  Layers3,
  Lock,
  MapPinned,
  ScanLine,
  ShieldCheck,
  Sparkles,
  TabletSmartphone,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BeforeAfterSlider } from "@/components/public/before-after-slider";
import { ContactLeadFormModal, ContactLeadModal } from "@/components/public/contact-lead-modal";
import { HomepageMotion } from "@/components/public/homepage-motion";

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

const heroSignals = ["QR בלי אפליקציה", "טיפול מתועד", "נוהל סגירה"];

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
    <div className="cleanpulse-home min-h-screen overflow-x-hidden bg-white text-foreground">
      <HomepageMotion />
      <header className="site-header sticky top-0 z-50 border-b border-white/70 bg-white/72 backdrop-blur-2xl">
        <div className="container-shell flex h-16 items-center justify-between gap-4">
          <Link href="/" className="brand-mark flex shrink-0 items-center gap-2.5" aria-label="CleanPulse">
            <span className="brand-mark-icon flex size-9 items-center justify-center rounded-full bg-brand text-white shadow-[0_16px_36px_rgba(30,136,229,0.2)]">
              <Droplets className="size-4" aria-hidden="true" />
            </span>
            <span className="text-base font-extrabold tracking-normal text-brand-deep">CleanPulse</span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-extrabold text-muted md:flex lg:gap-8" aria-label="ניווט ראשי">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} data-home-nav className="site-nav-link hover:text-brand-deep">
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
        <section className="hero-photo-section hero-premium-section">
          <Image
            src="/home/cp-hero-cinematic.webp"
            alt="כניסה יוקרתית לאזור שירותים עם עמדת דיווח CleanPulse"
            fill
            priority
            sizes="100vw"
            className="hero-photo-layer hero-photo-layer-1 object-cover object-left md:object-center"
          />
          <Image
            src="/home/cp-contact.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero-photo-layer hero-photo-layer-2 object-cover object-center"
            aria-hidden="true"
          />
          <Image
            src="/home/cp-before-clean.webp"
            alt=""
            fill
            sizes="100vw"
            className="hero-photo-layer hero-photo-layer-3 object-cover object-center"
            aria-hidden="true"
          />
          <div className="hero-photo-wash" aria-hidden="true" />
          <div className="hero-photo-vignette" aria-hidden="true" />
          <div className="hero-ambient-glow hero-ambient-glow-a" aria-hidden="true" />
          <div className="hero-ambient-glow hero-ambient-glow-b" aria-hidden="true" />

          <div className="container-shell relative z-10 grid min-h-[34rem] items-start py-12 sm:min-h-[38rem] sm:py-14 lg:min-h-[42rem] lg:items-center lg:py-10 lg:justify-items-start xl:min-h-[45rem]">
            <div className="hero-copy home-reveal w-full max-w-2xl space-y-7 pt-4 text-right sm:pt-6 lg:max-w-[38rem] lg:pt-0 lg:ps-8 xl:max-w-[40rem] xl:ps-12">
              <p className="hero-kicker">דיווח. טיפול. ודאות.</p>
              <h1 className="hero-headline text-balance font-heading text-5xl font-extrabold leading-[1.03] text-brand-deep sm:text-6xl lg:text-7xl">
                <span className="hero-headline-line">שירותים שמרגישים</span>
                {" "}
                <span className="hero-headline-line hero-headline-line-second">מטופלים.</span>
              </h1>
              <p className="max-w-xl text-lg font-bold leading-8 text-slate-700 sm:text-xl">
                CleanPulse מחבר בין מי שמדווח, מי שמטפל ומי שמנהל. בלי רעש, בלי ניירת, בלי פספוסים.
              </p>

              <div className="hero-cta-row flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link href="/login" className={buttonVariants({ variant: "primary", size: "xl" })}>
                  <Lock className="size-5" aria-hidden="true" />
                  כניסה למערכת
                </Link>
                <Link href="/kiosk-demo" className={buttonVariants({ variant: "secondary", size: "xl" })}>
                  צפייה בדמו
                  <ArrowLeft className="size-5" aria-hidden="true" />
                </Link>
              </div>

              <div className="hero-signal-row sm:justify-end" aria-label="יכולות מרכזיות">
                {heroSignals.map((signal) => (
                  <span key={signal}>{signal}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="scroll-section scroll-mt-24 bg-white py-16 sm:py-20">
          <div className="container-shell">
            <div className="scroll-card-grid grid gap-5 md:grid-cols-3">
              {highlights.map(({ icon: Icon, title, body, image }, index) => (
                <article
                  key={title}
                  className="highlight-photo-card home-premium-card home-reveal-on-scroll"
                  style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}
                >
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

        <section className="flow-story-section scroll-section bg-[#f4faff] py-24 sm:py-32">
          <div className="container-shell space-y-14">
            <div className="scroll-copy mx-auto max-w-4xl text-center">
              <p className="section-label">מה משתנה ברגע</p>
              <h2 className="mt-4 text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
                מהאורח הראשון ועד נוהל הסגירה.
              </h2>
            </div>

            <div className="scroll-card-grid story-photo-grid">
              <div className="story-flow-line" aria-hidden="true" />
              {storySteps.map((step, index) => (
                <article
                  key={step.number}
                  className="story-photo-panel home-reveal-on-scroll"
                  style={{ "--reveal-delay": `${index * 120}ms` } as CSSProperties}
                >
                  <Image src={step.image} alt={step.alt} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
                  <div className="story-photo-scrim" aria-hidden="true" />
                  <div className="story-step-node" aria-hidden="true">{step.number}</div>
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

        <section className="closer-section scroll-section bg-white py-24 sm:py-32">
          <div className="container-shell space-y-10">
            <div className="scroll-copy max-w-3xl">
              <p className="section-label">מבט מקרוב</p>
              <h2 className="mt-4 text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
                כל רגע קטן מקבל מקום ברור.
              </h2>
            </div>

            <div className="closer-editorial-grid scroll-media" aria-label="מבט מקרוב על CleanPulse">
              {closerItems.map((item, index) => (
                <article
                  key={item.label}
                  className={`closer-card home-reveal-on-scroll ${index === 0 ? "closer-card-featured" : ""}`}
                  style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}
                >
                  <div className="closer-card-media">
                    <Image src={item.image} alt={item.alt} fill sizes={index === 0 ? "(max-width: 768px) 100vw, 52vw" : "(max-width: 768px) 100vw, 28vw"} className="object-cover" />
                    <div className="closer-card-light" aria-hidden="true" />
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

        <section className="before-after-section scroll-section bg-[#f4faff] py-24 sm:py-32">
          <div className="container-shell space-y-10">
            <div className="scroll-copy mx-auto max-w-4xl text-center">
              <p className="section-label">לפני ואחרי</p>
              <h2 className="mt-4 text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
                רואים מיד כשמקום יוצא משליטה.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg font-bold leading-8 text-muted">
                אותו אזור. שני מצבים. דיווח קטן הופך רגע לא נעים למשימה ברורה.
              </p>
            </div>

            <div className="scroll-media">
              <BeforeAfterSlider
                beforeImage="/home/cp-before-dirty.webp"
                afterImage="/home/cp-before-clean.webp"
                beforeAlt="אזור שירותים לא נעים לפני טיפול"
                afterAlt="אותו אזור שירותים לאחר טיפול וניקיון"
              />
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

        <section id="managers" className="scroll-section scroll-mt-24 bg-[linear-gradient(180deg,#f4faff_0%,#ffffff_100%)] py-24 sm:py-32">
          <div className="container-shell grid gap-12 lg:grid-cols-[0.84fr_1.16fr] lg:items-center">
            <div className="scroll-copy space-y-7">
              <p className="section-label">למנהלים</p>
              <h2 className="text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
                לראות בדיוק מה דורש טיפול.
              </h2>
              <div className="scroll-card-grid grid gap-3 sm:grid-cols-2">
                {managerPoints.map((point) => (
                  <div key={point} className="rounded-3xl border border-white bg-white/78 px-5 py-4 text-lg font-extrabold text-brand-deep shadow-soft">
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="premium-media-frame scroll-media aspect-[16/10]">
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

        <section className="scroll-section bg-[#f4faff] py-24 sm:py-32">
          <div className="container-shell grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div className="scroll-copy space-y-7">
              <p className="section-label">מסניף לרשת</p>
              <h2 className="text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
                בנוי לצמוח מסניף אחד לרשת.
              </h2>
              <p className="max-w-xl text-lg font-bold leading-8 text-muted">
                סניפים, אזורי שירותים, מסכים ו־QR. אותו שקט, גם כשהעסק גדל.
              </p>
              <div className="scroll-card-grid grid gap-3 sm:grid-cols-2">
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

            <div className="premium-media-frame scroll-media aspect-[16/10]">
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

        <section id="pricing" className="pricing-section scroll-section scroll-mt-24 bg-white py-24 sm:py-32">
          <div className="container-shell space-y-12">
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
              <div className="scroll-copy space-y-5">
                <p className="section-label">מחירים</p>
                <h2 className="text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
                  להתחיל קטן. לגדול נקי.
                </h2>
                <p className="max-w-xl text-lg font-bold leading-8 text-muted">
                  בחרו לפי כמות המסכים והסניפים. בלי חוזה כבד ובלי עודף מערכת.
                </p>
              </div>

              <div className="pricing-media-frame scroll-media">
                <Image
                  src="/home/cp-pricing.webp"
                  alt="טאבלט עם תצוגת תוכניות CleanPulse בסביבת שירותים יוקרתית"
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="pricing-grid scroll-card-grid">
              {pricingPlans.map((plan, index) => (
                <article
                  key={plan.name}
                  className={`pricing-plan home-reveal-on-scroll ${plan.featured ? "pricing-plan-featured" : ""}`}
                  style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}
                >
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

        <section className="trust-section scroll-section relative isolate overflow-hidden bg-white py-24 sm:py-32">
          <div className="absolute inset-x-0 top-0 h-1/2 bg-[#f4faff]" aria-hidden="true" />
          <div className="container-shell relative z-10 space-y-12">
            <div className="premium-media-frame scroll-media mx-auto aspect-[16/7] max-w-6xl">
              <Image
                src="/home/cp-trust.webp"
                alt="אזור שירותים נקי עם סימני אמון ובקרה"
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="trust-image-overlay" aria-hidden="true" />
            </div>

            <div className="scroll-copy mx-auto max-w-4xl text-center">
              <p className="section-label">אמון</p>
              <h2 className="mt-4 text-balance font-heading text-4xl font-extrabold leading-tight text-brand-deep sm:text-6xl">
                פחות רעש. יותר ודאות.
              </h2>
            </div>

            <div className="scroll-card-grid grid gap-4 md:grid-cols-3">
              {trustItems.map(({ icon: Icon, title }, index) => (
                <article key={title} className="trust-panel home-reveal-on-scroll" style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}>
                  <Icon className="size-7 text-brand" aria-hidden="true" />
                  <h3 className="mt-8 text-2xl font-extrabold text-brand-deep">{title}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="final-photo-cta scroll-section scroll-mt-24">
          <Image src="/home/cp-contact.webp" alt="מנהל תפעול עם טאבלט ליד אזור שירותים יוקרתי" fill loading="eager" sizes="100vw" className="object-cover" />
          <div className="final-photo-overlay" aria-hidden="true" />
          <div className="container-shell relative z-10 grid gap-10 py-24 text-white lg:grid-cols-[1fr_26rem] lg:items-end sm:py-32">
            <div className="scroll-copy max-w-3xl space-y-6">
              <p className="text-sm font-extrabold text-brand-water">צור קשר</p>
              <h2 className="text-balance font-heading text-4xl font-extrabold leading-tight sm:text-6xl">
                בואו לראות את המקום שלכם עובד בשקט.
              </h2>
              <p className="max-w-2xl text-lg font-bold leading-8 text-white/76">
                דמו קצר, התאמה לפי מספר הסניפים, והבנה מה צריך כדי להתחיל נקי.
              </p>
              <div className="final-trust-pills" aria-label="מה כולל הדמו">
                <span>דמו קצר</span>
                <span>התאמה לפי סניפים</span>
                <span>בלי התחייבות כבדה</span>
              </div>
            </div>

            <div className="contact-panel scroll-media">
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

              <ContactLeadModal />

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
      <ContactLeadFormModal />
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
    <section id={id} className="scroll-section scroll-mt-24 bg-white py-24 sm:py-32">
      <div className={`container-shell grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div className="premium-media-frame scroll-media aspect-[16/10]">
          <Image src={image} alt={alt} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
        </div>

        <div className="scroll-copy space-y-6">
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
