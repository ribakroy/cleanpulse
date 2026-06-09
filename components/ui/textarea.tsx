import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, hint, id, ...props },
  ref,
) {
  const textareaId = id ?? props.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-foreground" htmlFor={textareaId}>
      {label ? <span>{label}</span> : null}
      <textarea
        ref={ref}
        id={textareaId}
        className={cn(
          "min-h-32 rounded-[var(--radius-md)] border border-border bg-white/90 px-4 py-3 text-base text-foreground shadow-soft outline-none placeholder:text-muted/70 focus:border-brand focus:bg-white focus:ring-3 focus:ring-brand/15",
          className,
        )}
        {...props}
      />
      {hint ? <span className="text-xs font-normal text-muted">{hint}</span> : null}
    </label>
  );
});
