"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  CreditCard,
  LayoutDashboard,
  Server,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const navItems: NavItem[] = [
  { href: "/super/dashboard", label: "מרכז השליטה", icon: LayoutDashboard },
  { href: "/super/organizations", label: "לקוחות ועסקים", icon: Building2 },
  { href: "/super/billing", label: "גבייה ותוכניות", icon: CreditCard },
  { href: "/super/usage", label: "מדדי שימוש", icon: Activity },
  { href: "/super/system", label: "מצב מערכת", icon: Server },
  { href: "/super/activity", label: "יומן פעילות", icon: ScrollText },
];

export function SuperNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-sky-500/10 text-sky-400 border-r-2 border-sky-400 pl-3 pr-2.5 bg-slate-800"
                : "text-slate-300 hover:bg-slate-800 hover:text-white",
            )}
          >
            <Icon className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
