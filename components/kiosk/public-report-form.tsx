"use client";

import { useState, useEffect, useTransition } from "react";
import { flushSync } from "react-dom";
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
  XCircle,
  Footprints
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
  dirty_floor: Footprints,
};

const SUCCESS_RESET_DELAY_MS = 2200;
const ERROR_RESET_DELAY_MS = 4200;
const DEMO_FEEDBACK_DELAY_MS = 120;

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
  isDemo?: boolean;
};

export function PublicReportForm({
  token,
  source,
  branchName,
  restroomName,
  issueTypes,
  isDemo = false,
}: PublicReportFormProps) {
  const [isIssuePending, startIssueTransition] = useTransition();
  const [, startRatingTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  
  // Prevent accidental duplicate taps on public screens.
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

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

    flushSync(() => {
      setStatus("submitting");
      setErrorMessage(null);
      setCooldowns((prev) => ({ ...prev, [cooldownKey]: Date.now() }));
    });

    startIssueTransition(async () => {
      if (isDemo) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_FEEDBACK_DELAY_MS));
        setStatus("success");
        setTimeout(() => {
          setStatus("idle");
          setSelectedRating(null);
        }, SUCCESS_RESET_DELAY_MS);
        return;
      }

      const result = await createPublicIncidentAction({
        token,
        source,
        issueKey: issueKey as IssueTypeKey,
      });

      if (result.success) {
        setStatus("success");
        setTimeout(() => {
          setStatus("idle");
          setSelectedRating(null);
        }, SUCCESS_RESET_DELAY_MS);
      } else {
        setStatus("error");
        setErrorMessage(result.error || "שגיאה לא ידועה בשליחת הדיווח");
        setCooldowns((prev) => {
          const next = { ...prev };
          delete next[cooldownKey];
          return next;
        });
        setTimeout(() => {
          setStatus("idle");
          setSelectedRating(null);
        }, ERROR_RESET_DELAY_MS);
      }
    });
  };

  const handleRate = (ratingValue: number) => {
    const cooldownKey = `rating_${ratingValue}`;
    if (cooldowns[cooldownKey]) return;

    flushSync(() => {
      setStatus("idle");
      setErrorMessage(null);
      setSelectedRating(ratingValue);
      setCooldowns((prev) => ({ ...prev, [cooldownKey]: Date.now() }));
    });

    startRatingTransition(async () => {
      if (isDemo) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_FEEDBACK_DELAY_MS));
        return;
      }

      const result = await createPublicIncidentAction({
        token,
        source,
        rating: ratingValue as 1 | 2 | 3 | 4 | 5,
      });

      if (!result.success) {
        setStatus("error");
        setErrorMessage(result.error || "לא הצלחנו לשלוח את הדירוג");
        setCooldowns((prev) => {
          const next = { ...prev };
          delete next[cooldownKey];
          return next;
        });
        setTimeout(() => {
          setStatus("idle");
          setSelectedRating(null);
        }, ERROR_RESET_DELAY_MS);
      }
    });
  };

  const handleCompleteWithoutIssue = () => {
    flushSync(() => setStatus("success"));
    setTimeout(() => {
      setStatus("idle");
      setSelectedRating(null);
    }, SUCCESS_RESET_DELAY_MS);
  };

  const isTablet = source === "kiosk";

  if (status === "submitting") {
    return (
      <div className="flex min-h-[56vh] flex-col items-center justify-center p-6 text-center">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 rounded-[var(--radius-xl)] border border-brand-water/50 bg-white/94 px-7 py-8 shadow-soft">
          <span className="flex size-20 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Loader2 className="size-10 animate-spin" />
          </span>
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
              שולחים את הדיווח
            </h2>
            <p className="text-base leading-7 text-muted">
              זה ייקח רגע קצר.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="mx-auto flex min-h-[56vh] max-w-md flex-col items-center justify-center space-y-6 p-6 text-center">
        <span className="flex size-24 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_12px_30px_rgba(16,185,129,0.22)]">
          <CheckCircle2 className="size-14 stroke-[2.5]" />
        </span>

        <div className="space-y-2">
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
            תודה, קיבלנו את הדיווח
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            הצוות קיבל עדכון ויטפל בזה בהקדם.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[56vh] text-center p-6 space-y-7 animate-success-pop max-w-md mx-auto">
        <span className="flex size-24 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-soft border border-red-100">
          <XCircle className="size-16" />
        </span>
        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground font-heading">לא הצלחנו לשלוח</h2>
          <p className="text-lg text-red-600 font-medium max-w-sm">{errorMessage}</p>
        </div>
        <button
          onClick={() => {
            setStatus("idle");
            setSelectedRating(null);
          }}
          className="w-full py-4 bg-brand text-white font-bold rounded-2xl hover:bg-brand-deep shadow-[0_8px_20px_rgba(30,136,229,0.25)] hover:shadow-[0_12px_24px_rgba(30,136,229,0.35)] active:scale-[0.98] transition-all cursor-pointer"
        >
          חזרה למסך הדיווח
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-9 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Glowing visual element at top */}
        <div className="h-1.5 w-12 rounded-full bg-brand/25 mb-1" />
        
        <h1 className="text-3xl font-black tracking-tight text-brand-deep sm:text-5xl font-heading leading-tight transition-all duration-300">
          {selectedRating === null ? "איך מצב השירותים?" : "תודה על הדירוג"}
        </h1>
        <p className="text-base text-muted max-w-lg leading-7 transition-all duration-300 sm:text-lg">
          {selectedRating === null 
            ? "דרגו בכוכבים או דווחו על תקלה."
            : "האם יש בעיה ספציפית שתרצו לדווח עליה?"}
        </p>
        
        <div className="w-full max-w-xl rounded-[var(--radius-lg)] border border-border bg-white/88 px-4 py-3 shadow-soft sm:inline-flex sm:w-auto sm:items-center sm:gap-3">
          <div className="mb-2 flex items-center justify-center gap-1.5 sm:mb-0">
            <span className="size-2 rounded-full bg-brand" />
            <span className="text-xs font-bold text-brand">דיווח ישיר</span>
          </div>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <div className="flex flex-col items-center justify-center gap-1 text-sm text-muted sm:flex-row sm:flex-wrap">
            <span><strong className="text-foreground font-semibold">{branchName}</strong></span>
            <span className="hidden text-border/80 sm:inline">·</span>
            <span><strong className="text-foreground font-semibold">{restroomName}</strong></span>
          </div>
        </div>
      </div>

      {selectedRating === null ? (
        /* Step 1: Star Rating Section */
        <div className="rounded-[var(--radius-xl)] border border-border bg-white/94 p-5 shadow-soft space-y-6 animate-in fade-in duration-300 max-w-lg mx-auto sm:p-8">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-brand-deep font-heading">דרגו אותנו בכוכבים</h3>
            <p className="text-sm text-muted">לחצו על הדירוג המתאים.</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex w-full items-center justify-center gap-0.5 py-2 sm:gap-2">
              {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => {
                const cooldownKey = `rating_${value}`;
                const isOnCooldown = !!cooldowns[cooldownKey];
                
                const isSelected = selectedRating === value;
                const isHighlighted = (hoveredRating !== null ? value <= hoveredRating : isSelected);

                return (
                  <button
                    key={value}
                    type="button"
                    disabled={isOnCooldown}
                    onMouseEnter={() => !isOnCooldown && setHoveredRating(value)}
                    onMouseLeave={() => setHoveredRating(null)}
                    onClick={() => {
                      if (typeof window !== "undefined" && window.navigator.vibrate) {
                        window.navigator.vibrate(30);
                      }
                      handleRate(value);
                    }}
                    className={cn(
                      "rounded-full p-1.5 hover:bg-amber-50/70 active:scale-90 transition-transform disabled:cursor-not-allowed cursor-pointer sm:p-3",
                      isOnCooldown ? "text-amber-500" : "text-brand"
                    )}
                    aria-label={`דירוג ${value} מתוך 5 כוכבים`}
                  >
                    <Star
                      className={cn(
                        "size-11 transition-all duration-200 sm:size-14",
                        isHighlighted 
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] scale-110" 
                          : "text-muted/30 fill-transparent"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
            
            {/* Dynamic feedback rating text */}
            <div className="h-6 flex items-center justify-center">
              {hoveredRating !== null && (
                <span className="text-sm font-bold text-amber-600 animate-in fade-in duration-200">
                  {hoveredRating === 1 && "לא טוב"}
                  {hoveredRating === 2 && "טעון שיפור"}
                  {hoveredRating === 3 && "סביר"}
                  {hoveredRating === 4 && "טוב"}
                  {hoveredRating === 5 && "מעולה"}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Step 2: Selected Rating Header (Interactive) & Issue Grid */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-300">
          
          {/* Interactive Rating Indicator */}
          <div className="flex flex-col items-center justify-center gap-2 bg-white/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-border shadow-soft max-w-xs mx-auto">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => {
                const isHighlighted = value <= selectedRating;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined" && window.navigator.vibrate) {
                        window.navigator.vibrate(30);
                      }
                      handleRate(value);
                    }}
                    className="p-1 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                  >
                    <Star
                      className={cn(
                        "size-7 transition-all duration-200",
                        isHighlighted 
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" 
                          : "text-muted/20 fill-transparent"
                      )}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-amber-700">
              {selectedRating === 1 && "לא טוב"}
              {selectedRating === 2 && "טעון שיפור"}
              {selectedRating === 3 && "סביר"}
              {selectedRating === 4 && "טוב"}
              {selectedRating === 5 && "מעולה"}
            </span>
          </div>

          {/* Issue grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-brand-deep pr-1 text-center">
              מה לא תקין?
            </h2>
            <div className={cn(
              "grid gap-4",
              isTablet ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"
            )}>
              {issueTypes.map((issue) => {
                const Icon = iconMap[issue.key] || AlertCircle;
                const cooldownKey = `issue_${issue.key}`;
                const isOnCooldown = !!cooldowns[cooldownKey];

                return (
                  <button
                    key={issue.key}
                    type="button"
                    disabled={isIssuePending || isOnCooldown}
                    onClick={() => {
                      // Haptic vibration feedback
                      if (typeof window !== "undefined" && window.navigator.vibrate) {
                        window.navigator.vibrate(40);
                      }
                      handleReportIssue(issue.key);
                    }}
                    className={cn(
                      "relative flex flex-col items-center justify-between p-5 text-center rounded-2xl select-none transition-all duration-300",
                      isTablet ? "min-h-[160px]" : "min-h-[135px]",
                      isOnCooldown 
                        ? "border-emerald-200 bg-emerald-50/50 text-emerald-800 shadow-[0_2px_10px_rgba(16,185,129,0.05)] cursor-not-allowed" 
                        : "border-border bg-white/94 shadow-soft hover:border-brand/30 hover:bg-brand-soft/35 cursor-pointer active:scale-95"
                    )}
                  >
                    {/* Icon Container */}
                    <div className={cn(
                      "flex size-14 items-center justify-center rounded-2xl transition-all duration-300 mb-2",
                      isOnCooldown 
                        ? "bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.2)]" 
                        : "bg-brand-soft text-brand group-hover:scale-110"
                    )}>
                      {isIssuePending && !isOnCooldown ? (
                        <Loader2 className="size-6 animate-spin" />
                      ) : isOnCooldown ? (
                        <CheckCircle2 className="size-7 stroke-[2.5]" />
                      ) : (
                        <Icon className="size-7 stroke-[2]" aria-hidden="true" />
                      )}
                    </div>
                    
                    <span className={cn(
                      "text-[16px] font-bold tracking-tight mb-1",
                      isOnCooldown ? "text-emerald-900" : "text-foreground"
                    )}>
                      {issue.labelHe}
                    </span>

                    {isOnCooldown ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full mt-1">
                        הדיווח נשלח!
                      </span>
                    ) : (
                      <span className="text-[11px] text-brand/80 font-medium opacity-0 hover:opacity-100 transition-opacity">
                        דיווח
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Complete Without Issue (Skip/Finish Button) */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleCompleteWithoutIssue}
              className={cn(
                "w-full sm:w-auto px-8 py-4 font-bold rounded-2xl shadow-soft hover:shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-md",
                selectedRating >= 4
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_8px_20px_rgba(16,185,129,0.25)]"
                  : "bg-white hover:bg-neutral-50 text-foreground border border-border"
              )}
            >
              {selectedRating >= 4 ? (
                <span>הכל תקין, תודה</span>
              ) : (
                <span>סיום ללא דיווח נוסף</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
