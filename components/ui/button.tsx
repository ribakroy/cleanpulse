import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "xl";
type ButtonElement = "button" | "a";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:opacity-55";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white shadow-soft hover:-translate-y-0.5 hover:bg-brand/92 hover:shadow-[0_18px_40px_rgba(30,136,229,0.2)]",
  secondary:
    "border border-border bg-white/92 text-brand-deep shadow-soft hover:-translate-y-0.5 hover:border-brand/25 hover:bg-brand-soft",
  outline: "border border-border bg-transparent text-brand-deep hover:border-brand/30 hover:bg-white/80",
  ghost: "bg-transparent text-muted hover:bg-brand-soft hover:text-brand-deep",
  danger: "bg-danger text-white shadow-soft hover:bg-danger/90",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  xl: "h-14 px-7 text-base",
};

type VariantOptions = {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  fullWidth?: boolean | undefined;
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  fullWidth = false,
}: VariantOptions = {}) {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size], fullWidth && "w-full");
}

type SharedButtonProps = VariantOptions & {
  children: ReactNode;
  className?: string;
  as?: ButtonElement;
};

type ButtonProps =
  | (SharedButtonProps & ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" })
  | (SharedButtonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a" });

export function Button(props: ButtonProps) {
  const { variant, size, fullWidth, className, children, as = "button", ...rest } = props;
  const classes = buttonVariants({ variant, size, fullWidth });

  if (as === "a") {
    return (
      <a className={cn(classes, className)} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button className={cn(classes, className)} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
