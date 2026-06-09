"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChartColumn,
  LayoutDashboard,
  LogOut,
  ListChecks,
  Mail,
  Settings,
  TabletSmartphone,
} from "lucide-react";
import {
  canManageRecipients,
  canViewIncidents,
  canViewLocations,
  canViewReports,
  canViewScreens,
  canViewSettings,
} from "@/lib/auth/permissions";
import type { SafeUserRecord } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  visible: (user: SafeUserRecord) => boolean;
  tone?: "default" | "danger";
};

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "סקירה כללית", icon: LayoutDashboard, visible: () => true },
  { href: "/admin/incidents", label: "דיווחים", icon: ListChecks, visible: canViewIncidents },
  { href: "/admin/reports", label: "דוחות", icon: ChartColumn, visible: canViewReports },
  { href: "/admin/branches", label: "סניפים ומיקומים", icon: Building2, visible: canViewLocations },
  { href: "/admin/screens", label: "מסכים וקישורים", icon: TabletSmartphone, visible: canViewScreens },
  { href: "/admin/recipients", label: "נמעני מייל", icon: Mail, visible: canManageRecipients },
  { href: "/admin/settings", label: "הגדרות", icon: Settings, visible: canViewSettings },
  { href: "/logout", label: "יציאה", icon: LogOut, visible: () => true, tone: "danger" },
];

export function AdminNav({ user }: { user: SafeUserRecord }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navItems.filter((item) => item.visible(user)).map(({ href, label, icon: Icon, tone = "default" }) => {
        const isActive = href !== "/logout" && (pathname === href || pathname.startsWith(`${href}/`));

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium",
              tone === "danger" && "text-danger hover:bg-danger/8 hover:text-danger",
              tone === "default" &&
                (isActive
                  ? "bg-brand-soft text-brand-deep shadow-soft"
                  : "text-muted hover:bg-white/75 hover:text-brand-deep"),
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
