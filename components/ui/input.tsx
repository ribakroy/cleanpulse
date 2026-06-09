import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, hint, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-foreground" htmlFor={inputId}>
      {label ? <span>{label}</span> : null}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "h-12 rounded-[var(--radius-md)] border border-border bg-white/90 px-4 text-base text-foreground shadow-soft outline-none placeholder:text-muted/70 focus:border-brand focus:bg-white focus:ring-3 focus:ring-brand/15",
          className,
        )}
        {...props}
      />
      {hint ? <span className="text-xs font-normal text-muted">{hint}</span> : null}
    </label>
  );
});
