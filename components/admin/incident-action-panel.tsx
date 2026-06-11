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
import { Loader2, RotateCcw } from "lucide-react";

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

  const handleAction = (actionFn: () => Promise<void>) => {
    setError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      try {
        await actionFn();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "אירעה שגיאה בביצוע הפעולה");
      }
    });
  };

  const handleResetRestroom = () => {
    const confirmed = window.confirm("הפעולה תסגור את כל הפניות הפתוחות באזור השירותים הזה. להמשיך?");
    if (!confirmed) return;

    setError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      try {
        const result = await resetRestroomIncidentsAction(incidentId);
        setSuccessMessage(`בוצע איפוס. נסגרו ${result.closedCount} פניות פתוחות.`);
        window.setTimeout(() => router.refresh(), 3600);
      } catch (err) {
        setError(err instanceof Error ? err.message : "אירעה שגיאה בביצוע האיפוס");
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
          onClick={handleResetRestroom}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
          סיימתי ניקוי ובדיקה מלאה
        </Button>
      </div>
    </div>
  );
}
