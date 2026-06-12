"use client";

import { useEffect } from "react";
import { logWorkPresenceAction } from "@/app/actions/work";

export function WorkPresenceBeacon({ restroomId }: { restroomId: string }) {
  useEffect(() => {
    void logWorkPresenceAction(restroomId).catch(() => {
      // Presence logging must not block the worker portal.
    });
  }, [restroomId]);

  return null;
}
