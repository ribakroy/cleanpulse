"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Clock3, Loader2, RotateCcw, Save } from "lucide-react";
import {
  runClosingResetNowAction,
  updateClosingProcedureAction,
} from "@/app/(admin)/admin/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type { ClosingResetMode } from "@/lib/data/types";

type ClosingProcedureFormProps = {
  closingTime?: string | undefined;
  closingResetMode?: ClosingResetMode | undefined;
  canManage: boolean;
};

const resetModeOptions: Array<{
  value: ClosingResetMode;
  title: string;
  description: string;
}> = [
  {
    value: "keep_open_incidents",
    title: "להשאיר פניות פתוחות",
    description: "הצוות ימשיך לטפל בהן ביום הבא.",
  },
  {
    value: "reset_open_incidents",
    title: "לסגור פניות פתוחות",
    description: "מתאים לעסקים שמבצעים ניקוי סוף יום מלא.",
  },
];

export function ClosingProcedureForm({
  closingTime,
  closingResetMode,
  canManage,
}: ClosingProcedureFormProps) {
  const [timeValue, setTimeValue] = useState(closingTime ?? "");
  const [modeValue, setModeValue] = useState<ClosingResetMode>(closingResetMode ?? "keep_open_incidents");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const shouldEnableReset = canManage && modeValue === "reset_open_incidents";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = await updateClosingProcedureAction(formData);
        setMessage({ type: result.ok ? "success" : "error", text: result.message });
      } catch (error) {
        setMessage({
          type: "error",
          text: error instanceof Error ? error.message : "לא הצלחנו לשמור את נוהל הסגירה",
        });
      }
    });
  };

  const handleResetNow = () => {
    const confirmed = window.confirm("הפעולה תסגור פניות פתוחות לפי נוהל הסגירה שהוגדר. להמשיך?");
    if (!confirmed) return;

    setMessage(null);
    startTransition(async () => {
      try {
        const result = await runClosingResetNowAction();
        setMessage({ type: result.ok ? "success" : "error", text: result.message });
      } catch (error) {
        setMessage({
          type: "error",
          text: error instanceof Error ? error.message : "לא הצלחנו לבצע איפוס סוף יום",
        });
      }
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.6fr)_1fr] lg:items-start">
        <Input
          type="time"
          name="closingTime"
          label="שעת סגירה"
          value={timeValue}
          onChange={(event) => setTimeValue(event.target.value)}
          disabled={!canManage || isPending}
          hint={timeValue ? `סגירת יום ב-${timeValue}` : "לא הוגדרה שעת סגירה"}
          dir="ltr"
          className="text-left"
        />

        <div className="grid gap-2">
          <span className="text-sm font-medium text-foreground">מדיניות סוף יום</span>
          <div className="grid gap-3 md:grid-cols-2">
            {resetModeOptions.map((option) => {
              const isSelected = modeValue === option.value;

              return (
                <label
                  key={option.value}
                  className={cn(
                    "rounded-[var(--radius-md)] border bg-white/90 p-4 transition-all",
                    canManage ? "cursor-pointer hover:border-brand/35 hover:bg-brand-soft/30" : "opacity-70",
                    isSelected ? "border-brand/45 shadow-soft ring-2 ring-brand/10" : "border-border",
                  )}
                >
                  <input
                    type="radio"
                    name="closingResetMode"
                    value={option.value}
                    checked={isSelected}
                    disabled={!canManage || isPending}
                    onChange={() => setModeValue(option.value)}
                    className="sr-only"
                  />
                  <span className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 items-center justify-center rounded-full border",
                        isSelected ? "border-brand bg-brand" : "border-border bg-white",
                      )}
                    >
                      <span className={cn("size-2 rounded-full bg-white", !isSelected && "hidden")} />
                    </span>
                    <span className="space-y-1">
                      <span className="block text-sm font-bold text-foreground">{option.title}</span>
                      <span className="block text-xs leading-5 text-muted">{option.description}</span>
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {message ? (
        <div
          className={cn(
            "rounded-[var(--radius-md)] border px-4 py-3 text-sm font-semibold",
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700",
          )}
        >
          {message.text}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Clock3 className="size-4 text-brand" />
          <span>{timeValue ? `שעת הסגירה: ${timeValue}` : "לא הוגדרה שעת סגירה"}</span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={!shouldEnableReset || isPending}
            onClick={handleResetNow}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
            איפוס סוף יום עכשיו
          </Button>
          <Button type="submit" disabled={!canManage || isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            שמירת נוהל
          </Button>
        </div>
      </div>

      {!shouldEnableReset && modeValue !== "reset_open_incidents" ? (
        <p className="text-xs leading-5 text-muted">
          האיפוס הידני זמין רק כאשר נבחרה מדיניות סגירת פניות פתוחות.
        </p>
      ) : null}
    </form>
  );
}
