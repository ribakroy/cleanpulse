import type { IncidentRecord } from "@/lib/data/types";

export function getElapsedTimeMinutes(openedAt: string): number {
  const diffMs = Date.now() - new Date(openedAt).getTime();
  return Math.max(0, Math.floor(diffMs / 60000));
}

export function getElapsedTimeLabel(openedAt: string): string {
  const diffMs = Date.now() - new Date(openedAt).getTime();
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMin < 60) {
    return `${diffMin} דקות`;
  }

  const diffHours = Math.floor(diffMin / 60);
  const remMin = diffMin % 60;
  if (diffHours < 24) {
    return `${diffHours} שעות ו-${remMin} דק'`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ימים`;
}

export function getTimeDifferenceLabel(startIso: string, endIso: string | null): string | null {
  if (!endIso) return null;
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const diffMin = Math.max(0, Math.floor((end - start) / 60000));

  if (diffMin < 60) {
    return `${diffMin} דקות`;
  }

  const diffHours = Math.floor(diffMin / 60);
  const remMin = diffMin % 60;
  return `${diffHours} שעות ו-${remMin} דק'`;
}

export function getTimeToAcknowledgement(incident: IncidentRecord): string | null {
  return getTimeDifferenceLabel(incident.openedAt, incident.acknowledgedAt);
}

export function getTimeToInProgress(incident: IncidentRecord): string | null {
  return getTimeDifferenceLabel(incident.openedAt, incident.inProgressAt);
}

export function getTimeToResolution(incident: IncidentRecord): string | null {
  const end = incident.resolvedAt || incident.dismissedAt;
  return getTimeDifferenceLabel(incident.openedAt, end);
}

export function isIncidentOverdue(incident: IncidentRecord): boolean {
  if (incident.status === "resolved" || incident.status === "dismissed") {
    return false;
  }
  const diffMin = getElapsedTimeMinutes(incident.openedAt);
  return diffMin >= 30;
}

export function getSlaStatus(incident: IncidentRecord): "normal" | "warning" | "danger" {
  if (incident.status === "resolved" || incident.status === "dismissed") {
    return "normal";
  }
  const diffMin = getElapsedTimeMinutes(incident.openedAt);
  if (diffMin >= 30) {
    return "danger";
  }
  if (diffMin >= 10) {
    return "warning";
  }
  return "normal";
}

export function getSlaBadgeStyles(incident: IncidentRecord): { bg: string; text: string; label: string } {
  const status = getSlaStatus(incident);
  if (incident.status === "resolved" || incident.status === "dismissed") {
    return {
      bg: "bg-slate-100",
      text: "text-slate-600",
      label: "טופל / סגור",
    };
  }

  if (status === "danger") {
    return {
      bg: "bg-red-50 border-red-200",
      text: "text-red-700",
      label: "חריג SLA",
    };
  }

  if (status === "warning") {
    return {
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-700",
      label: "דורש תשומת לב",
    };
  }

  return {
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    label: "תקין",
  };
}
