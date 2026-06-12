"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, MessageSquarePlus, Play, RotateCcw } from "lucide-react";
import {
  addIncidentNoteAction,
  resetRestroomIncidentsAction,
  resolveIncidentAction,
  startInProgressIncidentAction,
} from "@/app/actions/incidents";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type WorkerActionPanelProps = {
  incidentId: string;
  status: string;
};

export function WorkerActionPanel({ incidentId, status }: WorkerActionPanelProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const canStart = status === "open" || status === "acknowledged";
  const canResolve = status !== "resolved" && status !== "dismissed";

  const runAction = (action: () => Promise<void>, successText: string) => {
    setMessage(null);
    startTransition(async () => {
      try {
        await action();
        setMessage({ type: "success", text: successText });
        setNote("");
        router.refresh();
      } catch (error) {
        setMessage({
          type: "error",
          text: error instanceof Error ? error.message : "לא הצלחנו לבצע את הפעולה",
        });
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button
          type="button"
          size="lg"
          variant="secondary"
          disabled={isPending || !canStart}
          onClick={() => runAction(() => startInProgressIncidentAction(incidentId), "הטיפול סומן כהתחיל")}
          className="min-h-14 rounded-[var(--radius-md)]"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
          התחלתי טיפול
        </Button>
        <Button
          type="button"
          size="lg"
          disabled={isPending || !canResolve}
          onClick={() => runAction(() => resolveIncidentAction(incidentId, note), "הדיווח סומן כטופל")}
          className="min-h-14 rounded-[var(--radius-md)]"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          טופל
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          disabled={isPending || !canResolve}
          onClick={() => {
            if (window.confirm("לאשר ניקוי מקיף וסגירת פניות פתוחות באזור הזה?")) {
              runAction(async () => {
                await resetRestroomIncidentsAction(incidentId);
              }, "ניקוי מקיף נרשם והפניות הפתוחות נסגרו");
            }
          }}
          className="min-h-14 rounded-[var(--radius-md)]"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
          ניקוי מקיף
        </Button>
      </div>

      <div className="space-y-2">
        <Textarea
          label="הערת טיפול קצרה"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="מה בוצע בשטח?"
          maxLength={280}
          className="min-h-24"
          disabled={isPending}
        />
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending || !note.trim()}
            onClick={() => runAction(() => addIncidentNoteAction(incidentId, note), "ההערה נוספה")}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <MessageSquarePlus className="size-4" />}
            הוסף הערה
          </Button>
        </div>
      </div>

      {message ? (
        <div
          className={`rounded-[var(--radius-md)] border px-3 py-2 text-sm font-semibold ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}
    </div>
  );
}
