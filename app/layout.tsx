import type { Metadata, Viewport } from "next";
import { Rubik, Assistant } from "next/font/google";
import { env } from "@/lib/utils/env";
import "./globals.css";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  variable: "--font-assistant",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

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
    <html lang="he" dir="rtl" className={`${rubik.variable} ${assistant.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground font-sans">
        <div className="relative isolate flex min-h-full flex-col">{children}</div>
      </body>
    </html>
  );
}
