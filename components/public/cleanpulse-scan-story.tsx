import Image from "next/image";
import { BellRing, Droplets, Sparkles } from "lucide-react";
import { ScanStoryMotion } from "@/components/public/scan-story-motion";

const railSteps = [
  { id: "scan", label: "סריקה" },
  { id: "report", label: "בחירת דירוג" },
  { id: "success", label: "הצוות עודכן" },
  { id: "dirty", label: "הטיפול התחיל" },
  { id: "clean", label: "הכול נקי" },
];

const staticSteps = [
  {
    label: "סריקה",
    title: "האורח סורק בשנייה.",
    body: "שלט QR ברור, טלפון מולו, בלי אפליקציה ובלי התחברות.",
    image: "/homepage/scan-story/scan-context-bg.webp",
    alt: "סריקת QR בעמדת שירותים יוקרתית",
    tone: "photo",
  },
  {
    label: "דיווח",
    title: "הבחירה נשארת פשוטה.",
    body: "דירוג, בעיה אחת, ושליחה. ה־UI נשאר נקי וחד בעברית.",
    image: "/homepage/scan-story/phone-report-mockup.png",
    alt: "סמארטפון מציג דיווח שירותים",
    tone: "object",
  },
  {
    label: "לפני טיפול",
    title: "הבעיה נראית, אבל לא משתלטת על המותג.",
    body: "תמונה קרה ומבוקרת של חלל שיצא מעט משליטה.",
    image: "/homepage/scan-story/restroom-dirty.webp",
    alt: "חדר שירותים לפני טיפול",
    tone: "photo",
  },
  {
    label: "אחרי טיפול",
    title: "החלל חוזר לנראות נקייה ומבריקה.",
    body: "אותה זווית, תאורה בהירה יותר, ותחושת שליטה מלאה.",
    image: "/homepage/scan-story/restroom-clean.webp",
    alt: "חדר שירותים נקי לאחר טיפול",
    tone: "photo",
  },
];

export function CleanPulseScanStory() {
  return (
    <section id="scan-story" className="cleanpulse-scan-story" aria-labelledby="scan-story-title" data-step="scan">
      <ScanStoryMotion />

      <div className="cleanpulse-scan-story__sticky">
        <div className="scan-story-bg" aria-hidden="true" />
        <div className="scan-story-bg-wash" aria-hidden="true" />

        <div className="scan-story-copy scan-story-copy--intro">
          <p>סריקה אחת. טיפול שלם.</p>
          <h2 id="scan-story-title">האורח סורק. הצוות יודע. המקום חוזר לנראות מושלמת.</h2>
        </div>

        <div className="scan-story-qr-stage">
          <Image
            src="/homepage/scan-story/scan-context-bg.webp"
            alt="סריקת QR בעמדת שירותים יוקרתית"
            fill
            sizes="100vw"
            className="scan-story-context-bg"
          />
          <div className="scan-story-context-wash" aria-hidden="true" />
          <div className="scan-story-context-frame" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="scan-story-scan-beam" aria-hidden="true" />

          <div className="scan-story-phone-shell">
            <Image
              src="/homepage/scan-story/phone-hand.png"
              alt=""
              width={1024}
              height={1536}
              sizes="(min-width: 1280px) 39vw, (min-width: 768px) 56vw, 88vw"
              className="scan-story-phone-hand scan-story-phone-hand--camera"
              aria-hidden="true"
            />
            <Image
              src="/homepage/scan-story/phone-report-mockup.png"
              alt="סמארטפון מציג דיווח שירותים"
              width={1086}
              height={1448}
              sizes="(min-width: 1280px) 39vw, (min-width: 768px) 56vw, 88vw"
              className="scan-story-phone-hand scan-story-phone-hand--rating"
            />
            <Image
              src="/homepage/scan-story/phone-success-mockup.png"
              alt="סמארטפון מציג הודעת תודה שהדיווח בטיפול"
              width={1086}
              height={1448}
              sizes="(min-width: 1280px) 39vw, (min-width: 768px) 56vw, 88vw"
              className="scan-story-phone-hand scan-story-phone-hand--success"
            />
          </div>

          <div className="scan-story-flash" aria-hidden="true" />
          <div className="scan-story-signal" aria-hidden="true" />
          <div className="scan-story-notification">
            <BellRing className="size-4" aria-hidden="true" />
            הצוות עודכן
          </div>
        </div>

        <div className="scan-story-restroom-stage">
          <Image
            src="/homepage/scan-story/restroom-clean.webp"
            alt="חדר שירותים נקי לאחר טיפול"
            fill
            sizes="100vw"
            className="scan-story-restroom scan-story-restroom--clean"
          />
          <Image
            src="/homepage/scan-story/restroom-dirty.webp"
            alt="חדר שירותים לפני טיפול"
            fill
            sizes="100vw"
            className="scan-story-restroom scan-story-restroom--dirty"
          />
          <Image
            src="/homepage/scan-story/clean-bubbles.png"
            alt=""
            fill
            sizes="100vw"
            className="scan-story-bubbles"
            aria-hidden="true"
          />
          <div className="scan-story-clean-wipe" aria-hidden="true" />
        </div>

        <div className="scan-story-final">
          <div className="scan-story-final-logo" aria-label="CleanPulse">
            <span>
              <Droplets className="size-7" aria-hidden="true" />
            </span>
            <strong>CleanPulse</strong>
          </div>
          <h2>CleanPulse הופך תחזוקה לחוויה נשלטת</h2>
          <p>מהרגע שהאורח סורק — הצוות יודע, פועל ומתעד.</p>
        </div>

        <div className="scan-story-rail" aria-label="שלבי הדיווח">
          {railSteps.map((step) => (
            <span key={step.id} data-step={step.id}>
              {step.label}
            </span>
          ))}
        </div>
      </div>

      <div className="scan-story-static-cards">
        <div className="scan-story-mobile-rail" aria-label="שלבי הדיווח במובייל">
          {railSteps.map((step) => (
            <span key={step.id} data-step={step.id}>
              {step.label}
            </span>
          ))}
        </div>

        <div className="scan-story-static-intro">
          <p>סריקה אחת. טיפול שלם.</p>
          <h2>האורח סורק. הצוות יודע. המקום חוזר לנראות מושלמת.</h2>
        </div>

        {staticSteps.map((step) => (
          <article key={step.label} className={`scan-story-static-card scan-story-static-card--${step.tone}`}>
            <div className="scan-story-static-media">
              {step.tone === "object" ? (
                <Image
                  src={step.image}
                  alt={step.alt}
                  width={1086}
                  height={1448}
                  sizes="(max-width: 767px) 78vw, 24rem"
                  className="scan-story-static-image"
                />
              ) : (
                <Image src={step.image} alt={step.alt} fill sizes="100vw" className="scan-story-static-image" />
              )}
              {step.label === "אחרי טיפול" ? (
                <Image
                  src="/homepage/scan-story/clean-bubbles.png"
                  alt=""
                  fill
                  sizes="100vw"
                  className="scan-story-static-bubbles"
                  aria-hidden="true"
                />
              ) : null}
            </div>
            <div className="scan-story-static-copy">
              <span>{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </article>
        ))}

        <div className="scan-story-static-final">
          <Sparkles className="size-5" aria-hidden="true" />
          <span>CleanPulse הופך תחזוקה לחוויה נשלטת</span>
        </div>
      </div>

      <noscript>
        <div className="scan-story-noscript">CleanPulse הופך תחזוקה לחוויה נשלטת</div>
      </noscript>
    </section>
  );
}
