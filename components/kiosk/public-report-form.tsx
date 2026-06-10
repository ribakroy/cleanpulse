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
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  
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
        // Automatically reset to idle and reset rating after 3 seconds
        setTimeout(() => {
          setStatus("idle");
          setSelectedRating(null);
        }, 3000);
      } else {
        setStatus("error");
        setErrorMessage(result.error || "שגיאה לא ידועה בשליחת הדיווח");
        // Reset to idle and reset rating after 5 seconds on error
        setTimeout(() => {
          setStatus("idle");
          setSelectedRating(null);
        }, 5000);
      }
    });
  };

  const handleRate = (ratingValue: number) => {
    const cooldownKey = `rating_${ratingValue}`;
    if (cooldowns[cooldownKey]) return;

    setStatus("idle");
    setErrorMessage(null);

    // Transition state immediately to show issues step
    setSelectedRating(ratingValue);

    setCooldowns((prev) => ({ ...prev, [cooldownKey]: Date.now() }));

    startTransition(async () => {
      const result = await createPublicIncidentAction({
        token,
        source,
        rating: ratingValue as 1 | 2 | 3 | 4 | 5,
      });

      if (!result.success) {
        console.error("Failed to submit rating:", result.error);
      }
    });
  };

  const handleCompleteWithoutIssue = () => {
    setStatus("success");
    // Reset back to stars view after 3 seconds
    setTimeout(() => {
      setStatus("idle");
      setSelectedRating(null);
    }, 3000);
  };

  const isTablet = source === "kiosk";

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-8 animate-success-pop max-w-md mx-auto">
        <div className="relative flex items-center justify-center">
          {/* Animated pulsing rings */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping duration-1000 scale-150" />
          <div className="absolute inset-0 rounded-full bg-emerald-500/5 animate-pulse duration-1000 scale-125" />
          <span className="relative flex size-28 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_12px_30px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="size-16 stroke-[2.5]" />
          </span>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground font-heading">
            תודה, הדיווח התקבל!
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            הצוות קיבל עדכון ויטפל בזה בהקדם.
          </p>
        </div>
        
        {/* Countdown visual loader */}
        <div className="w-full space-y-2 pt-4">
          <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-countdown" />
          </div>
          <p className="text-xs font-medium text-muted/70">
            המסך יתאפס בעוד 3 שניות...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-8 animate-success-pop max-w-md mx-auto">
        <span className="flex size-24 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-soft border border-red-100">
          <XCircle className="size-16" />
        </span>
        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground font-heading">אופס, משהו השתבש</h2>
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
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Glowing visual element at top */}
        <div className="w-12 h-1.5 bg-brand/30 rounded-full mb-1 animate-pulse" />
        
        <h1 className="text-4xl font-black tracking-tight text-brand-deep sm:text-5xl font-heading leading-tight transition-all duration-300">
          {selectedRating === null ? "איך מצב השירותים?" : "תודה רבה על הדירוג!"}
        </h1>
        <p className="text-lg text-muted max-w-lg leading-relaxed transition-all duration-300">
          {selectedRating === null 
            ? "אנא דרגו את החוויה הכללית בכוכבים כדי שנוכל לשפר." 
            : "האם יש בעיה ספציפית שתרצו לדווח עליה?"}
        </p>
        
        {/* Floating location card (glass-premium) */}
        <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-border shadow-soft">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-brand animate-ping" />
            <span className="text-xs font-bold text-brand tracking-wide uppercase">דיווח ישיר</span>
          </div>
          <span className="h-4 w-[1px] bg-border" />
          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted">
            <span>סניף: <strong className="text-foreground font-semibold">{branchName}</strong></span>
            <span className="text-border/80">|</span>
            <span>שירותים: <strong className="text-foreground font-semibold">{restroomName}</strong></span>
          </div>
        </div>
      </div>

      {selectedRating === null ? (
        /* Step 1: Star Rating Section */
        <div className="glass-card rounded-[2rem] border border-border p-8 shadow-soft space-y-6 animate-in fade-in duration-300 max-w-lg mx-auto">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-brand-deep font-heading">דרגו אותנו בכוכבים</h3>
            <p className="text-sm text-muted">הכל בסדר? לחצו על הדירוג המתאים.</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-2 py-2">
              {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => {
                const cooldownKey = `rating_${value}`;
                const isOnCooldown = !!cooldowns[cooldownKey];
                
                const isSelected = selectedRating === value;
                const isHighlighted = (hoveredRating !== null ? value <= hoveredRating : isSelected);

                return (
                  <button
                    key={value}
                    type="button"
                    disabled={isPending || isOnCooldown}
                    onMouseEnter={() => !isOnCooldown && setHoveredRating(value)}
                    onMouseLeave={() => setHoveredRating(null)}
                    onClick={() => {
                      if (typeof window !== "undefined" && window.navigator.vibrate) {
                        window.navigator.vibrate(30);
                      }
                      handleRate(value);
                    }}
                    className={cn(
                      "p-3 rounded-full hover:bg-amber-50/70 active:scale-90 transition-transform disabled:cursor-not-allowed cursor-pointer",
                      isOnCooldown ? "text-amber-500" : "text-brand"
                    )}
                    aria-label={`דירוג ${value} מתוך 5 כוכבים`}
                  >
                    <Star
                      className={cn(
                        "size-14 transition-all duration-200",
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
                  {hoveredRating === 1 && "גרוע מאוד 😞"}
                  {hoveredRating === 2 && "טעון שיפור 😕"}
                  {hoveredRating === 3 && "סביר בהחלט 🙂"}
                  {hoveredRating === 4 && "טוב מאוד! 😊"}
                  {hoveredRating === 5 && "מעולה! הכל נקי ובסדר גמור 🤩"}
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
              {selectedRating === 1 && "גרוע מאוד 😞 (לחץ לשינוי)"}
              {selectedRating === 2 && "טעון שיפור 😕 (לחץ לשינוי)"}
              {selectedRating === 3 && "סביר בהחלט 🙂 (לחץ לשינוי)"}
              {selectedRating === 4 && "טוב מאוד! 😊 (לחץ לשינוי)"}
              {selectedRating === 5 && "מעולה! 🤩 (לחץ לשינוי)"}
            </span>
          </div>

          {/* Issue grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-brand-deep pr-1 text-center">
              סמנו מה לא תקין (לבחירת ריבוע אחד):
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
                    disabled={isPending || isOnCooldown}
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
                        : "glass-card glass-card-hover border-border cursor-pointer active:scale-95"
                    )}
                  >
                    {/* Icon Container */}
                    <div className={cn(
                      "flex size-14 items-center justify-center rounded-2xl transition-all duration-300 mb-2",
                      isOnCooldown 
                        ? "bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.2)]" 
                        : "bg-brand-soft text-brand group-hover:scale-110"
                    )}>
                      {isPending && !isOnCooldown ? (
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
                        דווח
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
                <span>הכל מעולה, תודה! ✨</span>
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
