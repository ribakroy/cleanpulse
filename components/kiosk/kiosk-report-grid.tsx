import type { LucideIcon } from "lucide-react";
import { AlertCircle, Droplets, FileText, Sparkles, Star, Trash2, Wind, Wrench } from "lucide-react";
import issueTypes from "@/data-seed/issue-types.json";
import { cn } from "@/lib/utils/cn";
import type { IssueTypeKey, IssueTypeSeed } from "@/types/domain";

const iconMap: Record<IssueTypeKey, LucideIcon> = {
  missing_paper: FileText,
  missing_soap: Droplets,
  not_clean: Sparkles,
  bad_smell: Wind,
  trash_full: Trash2,
  toilet_fault: Wrench,
  sink_fault: AlertCircle,
};

const seededIssues = issueTypes as IssueTypeSeed[];

type KioskReportGridProps = {
  compact?: boolean;
};

export function KioskReportGrid({ compact = false }: KioskReportGridProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {seededIssues.map((item) => {
          const Icon = iconMap[item.key];

          return (
            <button
              key={item.key}
              type="button"
              className={cn(
                "accent-ring flex min-h-28 flex-col items-center justify-center rounded-[var(--radius-lg)] border border-white/80 bg-white px-4 py-5 text-center shadow-soft hover:-translate-y-0.5",
                compact && "min-h-24",
              )}
            >
              <Icon className="mb-3 size-6 text-brand-deep" aria-hidden="true" />
              <span className="text-lg font-semibold text-foreground">{item.labelHe}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-white/90 p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-foreground">חוות דעת כללית</p>
            <p className="text-sm leading-7 text-muted">דירוג כללי מהיר, בלי טופס ובלי חיכוך.</p>
          </div>
          <span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand-deep">
            1–5 כוכבים
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => (
            <button
              key={value}
              type="button"
              className="flex h-16 items-center justify-center rounded-[var(--radius-md)] border border-border bg-surface-muted text-foreground hover:border-brand hover:bg-brand-soft"
            >
              <Star className="size-6 fill-current text-brand-deep" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
