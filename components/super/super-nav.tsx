"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  CreditCard,
  LayoutDashboard,
  Mail,
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
  { href: "/super/email-settings", label: "מייל ודומיין", icon: Mail },
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
