"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarClock,
  ChartColumn,
  LayoutDashboard,
  ListChecks,
  Mail,
  Settings,
  TabletSmartphone,
  UserCog,
} from "lucide-react";
import {
  canManageRecipients,
  canManageUsers,
  canViewIncidents,
  canViewLocations,
  canViewReports,
  canViewScreens,
  canViewSettings,
  canViewShifts,
} from "@/lib/auth/permissions";
import type { SafeUserRecord } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  visible: (user: SafeUserRecord) => boolean;
};

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "סקירה כללית", icon: LayoutDashboard, visible: () => true },
  { href: "/admin/incidents", label: "דיווחים", icon: ListChecks, visible: canViewIncidents },
  { href: "/admin/reports", label: "דוחות", icon: ChartColumn, visible: canViewReports },
  { href: "/admin/branches", label: "סניפים ומיקומים", icon: Building2, visible: canViewLocations },
  { href: "/admin/screens", label: "מסכים וקישורים", icon: TabletSmartphone, visible: canViewScreens },
  { href: "/admin/users", label: "משתמשים", icon: UserCog, visible: canManageUsers },
  { href: "/admin/shifts", label: "משמרות", icon: CalendarClock, visible: canViewShifts },
  { href: "/admin/recipients", label: "נמעני מייל", icon: Mail, visible: canManageRecipients },
  { href: "/admin/settings", label: "הגדרות", icon: Settings, visible: canViewSettings },
];

export function AdminNav({ user }: { user: SafeUserRecord }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.filter((item) => item.visible(user)).map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand text-white shadow-soft"
                : "text-muted hover:bg-brand-soft hover:text-brand-deep",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
