import { Clock3, MapPin, ScanQrCode } from "lucide-react";
import { KioskReportGrid } from "@/components/kiosk/kiosk-report-grid";
import { Badge } from "@/components/ui/badge";

type KioskPreviewProps = {
  compact?: boolean;
};

export function KioskPreview({ compact = false }: KioskPreviewProps) {
  return (
    <section className="surface-panel grid-soft overflow-hidden rounded-[var(--radius-xl)] p-4 sm:p-6">
      <div className="relative space-y-5">
        <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-white/85 bg-white/88 p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit">
              מסך טאבלט ציבורי
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">איך מצב השירותים עכשיו?</h2>
            <p className="text-sm leading-7 text-muted">
              לחיצה אחת מספיקה כדי לדווח. הדיווח נשלח בזמן אמת ללוח הניהול ולהתראות המייל.
            </p>
          </div>

          <div className="grid gap-2 text-sm text-muted sm:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-2">
              <MapPin className="size-4 text-brand-deep" aria-hidden="true" />
              סניף רמת אביב
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-2">
              <Clock3 className="size-4 text-brand-deep" aria-hidden="true" />
              פתוח עכשיו
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-2">
              <ScanQrCode className="size-4 text-brand-deep" aria-hidden="true" />
              QR backup link
            </span>
          </div>
        </div>

        <KioskReportGrid compact={compact} />
      </div>
    </section>
  );
}
