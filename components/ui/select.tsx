import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
};

export function Select({ className, label, hint, children, id, ...props }: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-foreground" htmlFor={selectId}>
      {label ? <span>{label}</span> : null}
      <span className="relative block">
        <select
          id={selectId}
          className={cn(
            "h-12 w-full appearance-none rounded-[var(--radius-md)] border border-border bg-white/90 px-4 text-base text-foreground shadow-soft outline-none focus:border-brand focus:bg-white focus:ring-3 focus:ring-brand/15",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4 text-muted"
          aria-hidden="true"
        />
      </span>
      {hint ? <span className="text-xs font-normal text-muted">{hint}</span> : null}
    </label>
  );
}
