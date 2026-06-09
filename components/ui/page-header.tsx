import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border bg-white/70 p-5 shadow-soft sm:flex-row sm:items-end sm:justify-between sm:p-6">
      <div className="space-y-3">
        {eyebrow ? (
          <Badge variant="secondary" className="w-fit">
            {eyebrow}
          </Badge>
        ) : null}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description ? <p className="max-w-3xl text-sm leading-7 text-muted">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
