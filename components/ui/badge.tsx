import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "primary" | "secondary" | "outline" | "success" | "warning" | "danger" | "neutral";

const badgeStyles: Record<BadgeVariant, string> = {
  primary: "bg-brand text-white",
  secondary: "border border-brand/10 bg-brand-soft text-brand-deep",
  outline: "border border-border bg-white/70 text-muted",
  success: "bg-status-resolved/18 text-foreground",
  warning: "bg-status-in-progress/22 text-foreground",
  danger: "bg-danger/15 text-danger",
  neutral: "bg-surface-muted text-muted",
};

export function Badge({
  className,
  variant = "primary",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant | undefined }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide",
        badgeStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
