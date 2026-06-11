import {
  Activity,
  Check,
  CheckCircle2,
  CircleDot,
  Clock3,
  Droplets,
  MapPin,
  QrCode,
  RotateCcw,
  ScanLine,
  Sparkles,
} from "lucide-react";

const reportOptions = ["חסר נייר", "נדרש ניקיון", "ריח לא נעים", "תקלה"];

const dashboardRows = [
  { title: "נדרש ניקיון", place: "קומה 2 · אגף צפוני", status: "בטיפול" },
  { title: "חסר סבון", place: "לובי ראשי", status: "פתוח" },
  { title: "בדיקת סגירה", place: "אזור עובדים", status: "נסגר" },
];

const branchDots = [
  { top: "22%", right: "18%", label: "תל אביב" },
  { top: "46%", right: "52%", label: "רעננה" },
  { top: "68%", right: "30%", label: "חיפה" },
];

export function WaterGlow({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.26)_0%,rgba(30,136,229,0.11)_38%,rgba(255,255,255,0)_72%)] blur-2xl ${className}`}
    />
  );
}

export function HeroVisual() {
  return (
    <div className="hero-product-stage" aria-label="מוקאפ מוצר CleanPulse">
      <WaterGlow className="-right-14 top-4 h-72 w-72 sm:h-96 sm:w-96" />
      <WaterGlow className="bottom-3 left-1 h-56 w-56 sm:h-72 sm:w-72" />
      <div className="hero-orbit" aria-hidden="true" />

      <div className="hero-tablet home-float-slow">
        <div className="device-topbar">
          <span className="device-dot" />
          <span className="device-dot bg-brand-water/70" />
          <span className="device-dot bg-brand/75" />
        </div>
        <TabletReportMockup compact />
      </div>

      <div className="hero-phone home-float">
        <PhoneReportMockup compact />
      </div>

      <div className="hero-dashboard-card">
        <DashboardMini />
      </div>

      <FloatingIncidentCard />
    </div>
  );
}

export function TabletReportMockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold text-brand">CleanPulse</p>
          <h3 className="mt-1 text-xl font-extrabold text-brand-deep sm:text-2xl">מה צריך טיפול?</h3>
        </div>
        <span className="flex size-11 items-center justify-center rounded-full bg-brand text-white shadow-[0_16px_30px_rgba(30,136,229,0.2)]">
          <Droplets className="size-5" aria-hidden="true" />
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {reportOptions.map((option, index) => (
          <div
            key={option}
            className={`rounded-3xl border p-4 ${
              index === 1
                ? "border-brand/35 bg-brand text-white shadow-[0_20px_42px_rgba(30,136,229,0.24)]"
                : "border-[#d8ecfa] bg-white text-brand-deep"
            }`}
          >
            <span
              className={`mb-4 flex size-9 items-center justify-center rounded-2xl ${
                index === 1 ? "bg-white/18 text-white" : "bg-[#f4faff] text-brand"
              }`}
            >
              {index === 0 ? <QrCode className="size-4" /> : <CircleDot className="size-4" />}
            </span>
            <p className="text-sm font-extrabold">{option}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[1.6rem] border border-brand/15 bg-[#f4faff] p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-extrabold text-brand-deep">תודה. הצוות עודכן.</span>
          <CheckCircle2 className="size-5 text-emerald-500" aria-hidden="true" />
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
          <div className="home-progress h-full rounded-full bg-gradient-to-l from-brand to-brand-water" />
        </div>
      </div>
    </div>
  );
}

export function PhoneReportMockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`phone-shell ${compact ? "phone-shell-compact" : ""}`}>
      <div className="phone-speaker" />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-brand">דיווח מהיר</span>
          <ScanLine className="size-4 text-brand" aria-hidden="true" />
        </div>
        <div className="rounded-[1.6rem] border border-[#d8ecfa] bg-white p-4 shadow-soft">
          <div className="mx-auto grid size-24 grid-cols-5 gap-1 rounded-2xl border border-brand/10 bg-[#f4faff] p-3">
            {Array.from({ length: 25 }).map((_, index) => (
              <span
                key={index}
                className={`rounded-[0.2rem] ${
                  [0, 1, 2, 5, 10, 12, 14, 17, 20, 22, 23, 24].includes(index)
                    ? "bg-brand-deep"
                    : index % 4 === 0
                      ? "bg-brand"
                      : "bg-transparent"
                }`}
              />
            ))}
          </div>
          <p className="mt-3 text-center text-xs font-bold text-muted">סריקה ליד התא</p>
        </div>
        <div className="space-y-2">
          {["נדרש ניקיון", "חסר נייר", "תקלה"].map((item, index) => (
            <div
              key={item}
              className={`flex items-center justify-between rounded-2xl px-3 py-2 text-xs font-extrabold ${
                index === 0 ? "bg-brand text-white" : "bg-[#f4faff] text-brand-deep"
              }`}
            >
              <span>{item}</span>
              {index === 0 ? <Check className="size-4" aria-hidden="true" /> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardPreview() {
  return (
    <div className="dashboard-preview">
      <div className="flex items-center justify-between border-b border-[#d8ecfa] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-brand text-white">
            <Droplets className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-brand-deep">תמונת מצב</p>
            <p className="text-xs font-bold text-muted">סניף דמו · עכשיו</p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
          פעיל
        </span>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["פתוח", "8", "text-rose-600"],
            ["בטיפול", "12", "text-brand"],
            ["נסגר היום", "43", "text-emerald-600"],
            ["מסכים", "18", "text-brand-deep"],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-3xl border border-[#d8ecfa] bg-white p-4">
              <p className="text-[11px] font-extrabold text-muted">{label}</p>
              <p className={`mt-2 text-3xl font-extrabold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-[#d8ecfa] bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-extrabold text-brand-deep">זרימת טיפול</p>
              <Activity className="size-4 text-brand" aria-hidden="true" />
            </div>
            <div className="flex h-36 items-end gap-2">
              {[32, 48, 42, 68, 60, 82, 74, 92, 66].map((height, index) => (
                <div key={index} className="flex flex-1 items-end rounded-full bg-[#f4faff]">
                  <span
                    className="home-bar block w-full rounded-full bg-gradient-to-t from-brand to-brand-water"
                    style={{ height: `${height}%`, animationDelay: `${index * 60}ms` }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#d8ecfa] bg-white p-5">
            <p className="mb-4 text-sm font-extrabold text-brand-deep">דיווחים אחרונים</p>
            <div className="space-y-3">
              {dashboardRows.map((row) => (
                <div key={row.title} className="rounded-2xl border border-[#edf6fd] bg-[#fbfdff] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-extrabold text-brand-deep">{row.title}</p>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-brand">
                      {row.status}
                    </span>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-xs font-bold text-muted">
                    <MapPin className="size-3" aria-hidden="true" />
                    {row.place}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClosingProcedureCard() {
  return (
    <div className="closing-card">
      <div className="flex items-center justify-between">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-brand text-white">
          <RotateCcw className="size-5" aria-hidden="true" />
        </span>
        <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-extrabold text-emerald-700">
          מוכן לסגירה
        </span>
      </div>
      <div className="mt-8">
        <p className="text-sm font-extrabold text-brand">נוהל סגירה</p>
        <h3 className="mt-2 text-3xl font-extrabold leading-tight text-brand-deep">כל יום נסגר נקי.</h3>
      </div>
      <div className="mt-8 space-y-3">
        {["בדיקה מלאה בוצעה", "פניות פתוחות אופסו", "מה שנשאר סומן להמשך"].map((item, index) => (
          <div key={item} className="flex items-center justify-between rounded-2xl border border-[#d8ecfa] bg-white/86 px-4 py-3">
            <span className="text-sm font-extrabold text-brand-deep">{item}</span>
            <span className={`flex size-7 items-center justify-center rounded-full ${index === 2 ? "bg-[#f4faff] text-brand" : "bg-emerald-50 text-emerald-600"}`}>
              <Check className="size-4" aria-hidden="true" />
            </span>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-3xl bg-[#f4faff] p-4">
        <div className="flex items-center justify-between text-xs font-extrabold text-muted">
          <span>20:45</span>
          <span>איפוס מצב שירותים</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full w-[78%] rounded-full bg-gradient-to-l from-brand to-brand-water" />
        </div>
      </div>
    </div>
  );
}

export function ScaleVisual() {
  return (
    <div className="scale-visual">
      <WaterGlow className="left-3 top-2 h-52 w-52" />
      <div className="relative h-full min-h-[360px]">
        <div className="absolute inset-8 rounded-[2rem] border border-[#d8ecfa] bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(244,250,255,0.9))]" />
        <div className="absolute inset-12 grid grid-cols-4 grid-rows-4 gap-3 opacity-70" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, index) => (
            <span key={index} className="rounded-2xl border border-[#d8ecfa] bg-white/70" />
          ))}
        </div>
        {branchDots.map((dot) => (
          <div
            key={dot.label}
            className="absolute rounded-3xl border border-white bg-white/90 px-4 py-3 shadow-soft backdrop-blur-xl"
            style={{ top: dot.top, right: dot.right }}
          >
            <div className="flex items-center gap-3">
              <span className="relative flex size-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/30" />
                <span className="relative inline-flex size-4 rounded-full bg-brand" />
              </span>
              <span className="text-sm font-extrabold text-brand-deep">{dot.label}</span>
            </div>
          </div>
        ))}
        <div className="absolute bottom-8 left-8 right-8 rounded-[1.7rem] border border-[#d8ecfa] bg-white/88 p-5 shadow-panel backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold text-brand-deep">רשת פעילה</p>
              <p className="mt-1 text-xs font-bold text-muted">סניפים, אזורים, מסכים ו־QR</p>
            </div>
            <Sparkles className="size-5 text-brand" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardMini() {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-extrabold text-brand-deep">עכשיו</p>
        <Clock3 className="size-4 text-brand" aria-hidden="true" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          ["פתוח", "8"],
          ["בטיפול", "12"],
          ["נסגר", "43"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-[#f4faff] p-3 text-center">
            <p className="text-[10px] font-extrabold text-muted">{label}</p>
            <p className="mt-1 text-xl font-extrabold text-brand-deep">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FloatingIncidentCard() {
  return (
    <div className="hero-incident-card home-float-reverse">
      <div className="flex items-start gap-3">
        <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <CheckCircle2 className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-extrabold text-brand-deep">הפנייה בטיפול</p>
          <p className="mt-1 text-xs font-bold leading-5 text-muted">קומה 2 · עודכן לפני דקה</p>
        </div>
      </div>
    </div>
  );
}
