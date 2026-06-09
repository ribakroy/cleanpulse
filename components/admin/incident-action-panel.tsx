"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  acknowledgeIncidentAction,
  startInProgressIncidentAction,
  resolveIncidentAction,
  dismissIncidentAction
} from "@/app/actions/incidents";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type IncidentActionPanelProps = {
  incidentId: string;
  currentStatus: string;
};

export function IncidentActionPanel({ incidentId, currentStatus }: IncidentActionPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [resolutionNote, setResolutionNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAction = (actionFn: () => Promise<void>) => {
    setError(null);
    startTransition(async () => {
      try {
        await actionFn();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "אירעה שגיאה בביצוע הפעולה");
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

      <div className="flex flex-wrap gap-2">
        {currentStatus === "open" && (
          <Button
            type="button"
            disabled={isPending}
            onClick={() => handleAction(() => acknowledgeIncidentAction(incidentId))}
            className="bg-brand text-white hover:bg-brand-deep cursor-pointer"
          >
            {isPending && <Loader2 className="size-4 animate-spin ml-2 inline animate-spin" />}
            אשר קבלה
          </Button>
        )}

        {(currentStatus === "open" || currentStatus === "acknowledged") && (
          <Button
            type="button"
            disabled={isPending}
            onClick={() => handleAction(() => startInProgressIncidentAction(incidentId))}
            className="bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
          >
            {isPending && <Loader2 className="size-4 animate-spin ml-2 inline animate-spin" />}
            התחל טיפול
          </Button>
        )}
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted pr-1">הערת סגירה / פתרון (אופציונלי)</label>
          <textarea
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            placeholder="פרט/י כאן את אופן הטיפול או סיבת הדחייה..."
            className="w-full border border-border p-3 rounded-lg text-sm bg-white focus:outline-none focus:border-brand min-h-[80px]"
            disabled={isPending}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => handleAction(() => dismissIncidentAction(incidentId, resolutionNote))}
            className="border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
          >
            {isPending && <Loader2 className="size-4 animate-spin ml-2 inline animate-spin" />}
            דחה דיווח
          </Button>

          <Button
            type="button"
            disabled={isPending}
            onClick={() => handleAction(() => resolveIncidentAction(incidentId, resolutionNote))}
            className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
          >
            {isPending && <Loader2 className="size-4 animate-spin ml-2 inline animate-spin" />}
            סמן כטופל
          </Button>
        </div>
      </div>
    </div>
  );
}
