"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  acknowledgeIncidentAction,
  startInProgressIncidentAction,
  resolveIncidentAction,
  dismissIncidentAction,
  resetRestroomIncidentsAction,
} from "@/app/actions/incidents";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, RotateCcw, X } from "lucide-react";

const cleaningChecklistItems = [
  { id: "paper", label: "נייר טואלט מלא וזמין בכל התאים" },
  { id: "soap", label: "סבון ידיים מלא ותקין" },
  { id: "bins", label: "פחים רוקנו והוחזרו למקום" },
  { id: "toilets", label: "אסלות ומשתנות נקיות ותקינות" },
  { id: "sinks", label: "כיורים, ברזים ומראות נקיים ותקינים" },
  { id: "floor", label: "רצפה נקייה, יבשה וללא לכלוך" },
  { id: "smell", label: "אין ריח חריג באזור השירותים" },
  { id: "reporting", label: "מסך/QR הדיווח גלוי ותקין" },
] as const;

type IncidentActionPanelProps = {
  incidentId: string;
  currentStatus: string;
};

export function IncidentActionPanel({ incidentId, currentStatus }: IncidentActionPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [resolutionNote, setResolutionNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const allChecklistItemsChecked = cleaningChecklistItems.every((item) => checkedItems[item.id]);

  const handleAction = (actionFn: () => Promise<void>) => {
    setError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      try {
        await actionFn();
        router.refresh();
      } catch (err) {
        console.error("Failed to update incident:", err);
        setError("לא הצלחנו לבצע את הפעולה. נסו שוב בעוד רגע.");
      }
    });
  };

  const toggleChecklistItem = (itemId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const openResetChecklist = () => {
    setError(null);
    setSuccessMessage(null);
    setCheckedItems({});
    setIsChecklistOpen(true);
  };

  const closeResetChecklist = () => {
    if (isPending) return;
    setIsChecklistOpen(false);
  };

  const handleResetRestroom = () => {
    if (!allChecklistItemsChecked) return;

    setError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      try {
        const result = await resetRestroomIncidentsAction(incidentId);
        setIsChecklistOpen(false);
        setCheckedItems({});
        setSuccessMessage(`בוצע איפוס. נסגרו ${result.closedCount} פניות פתוחות.`);
        window.setTimeout(() => router.refresh(), 3600);
      } catch (err) {
        console.error("Failed to reset restroom incidents:", err);
        setError("לא הצלחנו לבצע את האיפוס. נסו שוב בעוד רגע.");
      }
    });
  };

  const isClosed = currentStatus === "resolved" || currentStatus === "dismissed";

  if (isClosed) {
    return (
      <div className="bg-slate-50 border border-border p-4 rounded-xl text-center text-muted text-sm font-semibold">
        דיווח זה סגור ולא ניתן לבצע פעולות נוספות.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg font-semibold">
          {successMessage}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {currentStatus === "open" && (
          <Button
            type="button"
            variant="primary"
            disabled={isPending}
            onClick={() => handleAction(() => acknowledgeIncidentAction(incidentId))}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            אשר קבלה
          </Button>
        )}

        {(currentStatus === "open" || currentStatus === "acknowledged") && (
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={() => handleAction(() => startInProgressIncidentAction(incidentId))}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            התחל טיפול
          </Button>
        )}
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <Textarea
          label="הערת סגירה"
          value={resolutionNote}
          onChange={(e) => setResolutionNote(e.target.value)}
          placeholder="מה בוצע בשטח?"
          disabled={isPending}
          className="min-h-[80px]"
        />

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="danger"
            disabled={isPending}
            onClick={() => handleAction(() => dismissIncidentAction(incidentId, resolutionNote))}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            דחה דיווח
          </Button>

          <Button
            type="button"
            variant="primary"
            disabled={isPending}
            onClick={() => handleAction(() => resolveIncidentAction(incidentId, resolutionNote))}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            סמן כטופל
          </Button>
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <div>
          <p className="text-sm font-bold text-foreground">ניקוי ובדיקה מלאה</p>
          <p className="text-xs leading-6 text-muted">
            מתאים לאחר מעבר מלא באזור השירותים. הפעולה סוגרת פניות פתוחות באותו אזור בלבד.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          fullWidth
          disabled={isPending}
          onClick={openResetChecklist}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
          סיימתי ניקוי ובדיקה מלאה
        </Button>
      </div>

      {isChecklistOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cleaning-checklist-title"
        >
          <div className="w-full max-w-xl rounded-2xl border border-brand-water/60 bg-white p-5 shadow-[0_24px_80px_rgba(15,39,66,0.22)]">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div className="space-y-1">
                <h2 id="cleaning-checklist-title" className="text-xl font-extrabold tracking-tight text-foreground">
                  אישור ניקוי ובדיקה מלאה
                </h2>
                <p className="text-sm leading-6 text-muted">
                  סמן כל סעיף שבוצע. רק אחרי שכל הבדיקות מסומנות אפשר לסגור את הפניות באזור.
                </p>
              </div>
              <button
                type="button"
                onClick={closeResetChecklist}
                disabled={isPending}
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted transition hover:bg-surface-muted hover:text-foreground disabled:opacity-50"
                aria-label="סגירת מסך אישור"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {cleaningChecklistItems.map((item) => {
                const checked = !!checkedItems[item.id];

                return (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-white px-3 py-3 text-sm font-semibold text-foreground transition hover:border-brand-water hover:bg-brand-soft/30"
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleChecklistItem(item.id)}
                      disabled={isPending}
                    />
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full border transition ${
                        checked
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-border bg-white text-transparent"
                      }`}
                      aria-hidden="true"
                    >
                      <CheckCircle2 className="size-4" />
                    </span>
                    <span>{item.label}</span>
                  </label>
                );
              })}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                disabled={isPending}
                onClick={closeResetChecklist}
              >
                ביטול
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={isPending || !allChecklistItemsChecked}
                onClick={handleResetRestroom}
              >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                אשר וסגור פניות פתוחות
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
