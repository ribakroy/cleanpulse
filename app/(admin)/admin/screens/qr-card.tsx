"use client";

import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";

export function QrCard({ qrUrl, kioskUrl, publicToken, qrToken }: { qrUrl: string, kioskUrl: string, publicToken: string, qrToken: string }) {
  const handleCopy = (url: string) => navigator.clipboard.writeText(url);
  const handleDownload = () => {
    const svg = document.getElementById("qr-code-svg");
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
      downloadLink.download = "qr-code.png";
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-4 p-4 border rounded bg-white">
      <div className="flex-shrink-0 bg-white p-2 border rounded">
        <QRCode id="qr-code-svg" value={qrUrl} size={128} />
      </div>
      <div className="flex flex-col justify-center space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm bg-muted text-white px-2 py-1 rounded">/q/{qrToken.substring(0,8)}...</span>
          <Button variant="outline" size="sm" onClick={() => handleCopy(qrUrl)}>העתק קישור QR</Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>הורד QR</Button>
          <Button variant="outline" size="sm" as="a" href={qrUrl} target="_blank">פתיחה לתצוגה</Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm bg-muted text-white px-2 py-1 rounded">/k/{publicToken.substring(0,8)}...</span>
          <Button variant="outline" size="sm" onClick={() => handleCopy(kioskUrl)}>העתק קישור Kiosk</Button>
        </div>
      </div>
    </div>
  );
}
