"use client";

import { useState, useEffect, useTransition } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Droplets,
  FileText,
  Sparkles,
  Star,
  Trash2,
  Wind,
  Wrench,
  Loader2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createPublicIncidentAction } from "@/app/actions/kiosk";
import type { IssueTypeKey } from "@/types/domain";

const iconMap: Record<string, LucideIcon> = {
  missing_paper: FileText,
  missing_soap: Droplets,
  not_clean: Sparkles,
  bad_smell: Wind,
  trash_full: Trash2,
  toilet_fault: Wrench,
  sink_fault: AlertCircle,
};

type IssueType = {
  id: string;
  key: string;
  labelHe: string;
  icon: string;
  severity: string;
};

type PublicReportFormProps = {
  token: string;
  source: "kiosk" | "qr";
  branchName: string;
  restroomName: string;
  issueTypes: IssueType[];
};

export function PublicReportForm({
  token,
  source,
  branchName,
  restroomName,
  issueTypes,
}: PublicReportFormProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  
  // Client-side rate limit tracking to disable specific buttons for 10s after click
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  // Clean up timers if component unmounts
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCooldowns((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const [key, timestamp] of Object.entries(next)) {
          if (now - timestamp >= 10000) {
            delete next[key];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleReportIssue = (issueKey: string) => {
    const cooldownKey = `issue_${issueKey}`;
    if (cooldowns[cooldownKey]) return;

    setStatus("idle");
    setErrorMessage(null);

    // Add immediate client side cooldown
    setCooldowns((prev) => ({ ...prev, [cooldownKey]: Date.now() }));

    startTransition(async () => {
      const result = await createPublicIncidentAction({
        token,
        source,
        issueKey: issueKey as IssueTypeKey,
      });

      if (result.success) {
        setStatus("success");
        // Automatically reset to idle after 3 seconds
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      } else {
        setStatus("error");
        setErrorMessage(result.error || "שגיאה לא ידועה בשליחת הדיווח");
        // Reset to idle after 5 seconds on error
        setTimeout(() => {
          setStatus("idle");
        }, 5000);
      }
    });
  };

  const handleRate = (ratingValue: number) => {
    const cooldownKey = `rating_${ratingValue}`;
    if (cooldowns[cooldownKey]) return;

    setStatus("idle");
    setErrorMessage(null);

    setCooldowns((prev) => ({ ...prev, [cooldownKey]: Date.now() }));

    startTransition(async () => {
      const result = await createPublicIncidentAction({
        token,
        source,
        rating: ratingValue as 1 | 2 | 3 | 4 | 5,
      });

      if (result.success) {
        setStatus("success");
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      } else {
        setStatus("error");
        setErrorMessage(result.error || "שגיאה לא ידועה בשליחת הדירוג");
        setTimeout(() => {
          setStatus("idle");
        }, 5000);
      }
    });
  };

  const isTablet = source === "kiosk";

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6 animate-in fade-in duration-300">
        <span className="flex size-24 items-center justify-center rounded-full bg-brand-soft text-brand shadow-soft">
          <CheckCircle2 className="size-16 animate-bounce" />
        </span>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-foreground">תודה, הדיווח התקבל!</h2>
          <p className="text-xl text-muted max-w-md">הצוות קיבל עדכון ויטפל בזה בהקדם.</p>
        </div>
        <p className="text-sm text-muted animate-pulse">המסך יתאפס בעוד 3 שניות...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6 animate-in fade-in duration-300">
        <span className="flex size-24 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-soft">
          <XCircle className="size-16" />
        </span>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-foreground">אופס, משהו השתבש</h2>
          <p className="text-xl text-red-600 max-w-md">{errorMessage}</p>
        </div>
        <button
          onClick={() => setStatus("idle")}
          className="px-6 py-3 bg-brand text-white font-semibold rounded-full hover:bg-brand-deep shadow-soft"
        >
          חזרה למסך הדיווח
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="flex flex-col items-center text-center space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          איך מצב השירותים?
        </h1>
        <p className="text-lg text-muted max-w-xl">
          אנא סמן/י מה לא תקין או דרג/י את החוויה הכללית כדי שנוכל לשפר.
        </p>
        <div className="inline-flex flex-wrap justify-center gap-2 text-sm text-muted bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-border">
          <span>סניף: <strong className="text-foreground">{branchName}</strong></span>
          <span className="text-border">|</span>
          <span>שירותים: <strong className="text-foreground">{restroomName}</strong></span>
        </div>
      </div>

      {/* Main reporting grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground pr-2">בחר/י מה לא תקין:</h2>
        <div className={cn(
          "grid gap-4",
          isTablet ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-2"
        )}>
          {issueTypes.map((issue) => {
            const Icon = iconMap[issue.key] || AlertCircle;
            const cooldownKey = `issue_${issue.key}`;
            const isOnCooldown = !!cooldowns[cooldownKey];

            return (
              <button
                key={issue.key}
                type="button"
                disabled={isPending || isOnCooldown}
                onClick={() => handleReportIssue(issue.key)}
                className={cn(
                  "relative flex flex-col items-center justify-center p-6 text-center border bg-white shadow-soft rounded-[var(--radius-lg)] select-none",
                  isTablet ? "min-h-[160px]" : "min-h-[120px]",
                  "hover:-translate-y-1 active:translate-y-0 active:scale-95 disabled:hover:translate-y-0 disabled:active:scale-100",
                  isOnCooldown 
                    ? "border-muted/30 bg-muted/5 opacity-55 cursor-not-allowed" 
                    : "border-border hover:border-brand-water/80 hover:bg-brand-soft/30 cursor-pointer"
                )}
              >
                {isPending && !isOnCooldown ? (
                  <Loader2 className="size-8 text-brand animate-spin mb-3" />
                ) : (
                  <Icon className={cn(
                    "size-8 mb-3",
                    isOnCooldown ? "text-muted" : "text-brand"
                  )} aria-hidden="true" />
                )}
                
                <span className={cn(
                  "text-lg font-bold tracking-tight",
                  isOnCooldown ? "text-muted" : "text-foreground"
                )}>
                  {issue.labelHe}
                </span>

                {isOnCooldown && (
                  <span className="absolute bottom-2 text-xs font-semibold text-muted bg-surface-muted px-2 py-0.5 rounded-full">
                    התקבל
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Star rating section */}
      <div className="surface-panel rounded-[var(--radius-xl)] border border-border p-6 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">דירוג כללי של השירותים</h3>
            <p className="text-sm text-muted">הכל בסדר? דרג/י אותנו בכוכבים.</p>
          </div>
          <span className="w-fit rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
            מהיר ללא טופס
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 py-2">
          {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => {
            const cooldownKey = `rating_${value}`;
            const isOnCooldown = !!cooldowns[cooldownKey];
            const isHighlighted = (hoveredRating !== null ? value <= hoveredRating : false);

            return (
              <button
                key={value}
                type="button"
                disabled={isPending || isOnCooldown}
                onMouseEnter={() => !isOnCooldown && setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(null)}
                onClick={() => handleRate(value)}
                className={cn(
                  "p-3 rounded-full hover:bg-brand-soft/40 active:scale-90 transition-transform disabled:opacity-50 disabled:cursor-not-allowed",
                  isOnCooldown ? "bg-muted/5 text-muted" : "text-brand"
                )}
                aria-label={`דירוג ${value} מתוך 5 כוכבים`}
              >
                <Star
                  className={cn(
                    "size-10 transition-all",
                    isHighlighted ? "fill-brand text-brand scale-110" : "text-brand/50 fill-transparent"
                  )}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
