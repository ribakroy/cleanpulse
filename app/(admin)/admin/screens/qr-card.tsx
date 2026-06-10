"use client";

import dynamic from "next/dynamic";
import { Copy, Download, ExternalLink, QrCode, TabletSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dynamically import QRCode with SSR disabled to prevent Node.js environment errors during pre-rendering.
const QRCode = dynamic(() => import("react-qr-code"), {
  ssr: false,
});

export function QrCard({
  qrUrl,
  kioskUrl,
  qrToken,
  canEdit = false,
  isActive = false,
  onDeactivate,
  onRegenerate,
}: {
  qrUrl: string;
  kioskUrl: string;
  publicToken: string;
  qrToken: string;
  canEdit?: boolean;
  isActive?: boolean;
  onDeactivate?: string | ((formData: FormData) => void | Promise<void>);
  onRegenerate?: string | ((formData: FormData) => void | Promise<void>);
}) {
  const handleCopy = (url: string) => navigator.clipboard.writeText(url);

  const handleDownload = () => {
    const svgId = `qr-code-svg-${qrToken}`;
    const svg = document.getElementById(svgId);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "cleanpulse-qr.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-white/88 p-4 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-border bg-white p-4 self-start">
          <QRCode id={`qr-code-svg-${qrToken}`} value={qrUrl} size={118} />
        </div>

        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <div className="rounded-[var(--radius-md)] border border-border bg-surface-muted p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-deep">
              <QrCode className="size-3.5 shrink-0" aria-hidden="true" />
              קישור לסריקה בנייד
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button variant="outline" size="sm" onClick={() => handleCopy(qrUrl)}>
                <Copy className="size-3.5" aria-hidden="true" />
                העתקת קישור
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="size-3.5" aria-hidden="true" />
                הורדה
              </Button>
              <Button variant="outline" size="sm" as="a" href={qrUrl} target="_blank">
                <ExternalLink className="size-3.5" aria-hidden="true" />
                פתיחה
              </Button>
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] border border-border bg-surface-muted p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-deep">
              <TabletSmartphone className="size-3.5 shrink-0" aria-hidden="true" />
              קישור למסך טאבלט
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button variant="outline" size="sm" onClick={() => handleCopy(kioskUrl)}>
                <Copy className="size-3.5" aria-hidden="true" />
                העתקת קישור
              </Button>
              <Button variant="outline" size="sm" as="a" href={kioskUrl} target="_blank">
                <ExternalLink className="size-3.5" aria-hidden="true" />
                פתיחה
              </Button>
            </div>
          </div>
        </div>
      </div>

      {canEdit && isActive && onDeactivate && onRegenerate && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
          <form action={onDeactivate}>
            <Button variant="danger" size="sm" type="submit">
              השבת מסך
            </Button>
          </form>
          <form action={onRegenerate} onSubmit={(e) => {
            if (!confirm("האם לאפס את הקישורים? הקישורים הישנים יפסיקו לעבוד.")) {
              e.preventDefault();
            }
          }}>
            <Button variant="outline" size="sm" type="submit">
              יצירת קישורים חדשים
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
