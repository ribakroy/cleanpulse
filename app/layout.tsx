import type { Metadata, Viewport } from "next";
import { env } from "@/lib/utils/env";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  applicationName: "CleanPulse",
  title: {
    default: "CleanPulse",
    template: "%s | CleanPulse",
  },
  description: "דיווחי שירותים בזמן אמת לעסקים, טאבלט ציבורי ולוח ניהול בעברית מלאה.",
};

export const viewport: Viewport = {
  themeColor: "#1E88E5",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <div className="relative isolate flex min-h-full flex-col">{children}</div>
      </body>
    </html>
  );
}
