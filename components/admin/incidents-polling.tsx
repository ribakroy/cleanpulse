"use client";

import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IncidentsPolling({ intervalMs = 12000 }: { intervalMs?: number }) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(() => {
        router.refresh();
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [router, intervalMs]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    startTransition(() => {
      router.refresh();
      setTimeout(() => setIsRefreshing(false), 500);
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleManualRefresh}
      disabled={isRefreshing}
      className="gap-2 bg-white/80 border-border hover:bg-brand-soft/50 shadow-soft"
    >
      <RefreshCw className={`size-4 text-brand-deep ${isRefreshing ? "animate-spin" : ""}`} />
      רענן נתונים
    </Button>
  );
}
