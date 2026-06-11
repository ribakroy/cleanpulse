import type { IncidentRecord, IssueTypeRecord } from "@/lib/data/types";

export function createIssueTypeLabelMap(issueTypes: IssueTypeRecord[]) {
  return new Map(issueTypes.map((issueType) => [issueType.key, issueType.labelHe] as const));
}

export function formatIncidentTitle(incident: IncidentRecord, issueTypeLabels: Map<string, string>) {
  if (incident.issueKey) {
    return issueTypeLabels.get(incident.issueKey) ?? incident.issueKey;
  }

  if (incident.rating) {
    return "ציון כללי";
  }

  return "דיווח כללי";
}

export function formatIncidentRatingSubtitle(incident: Pick<IncidentRecord, "rating">) {
  if (incident.rating) {
    return `ציון כללי ${incident.rating}/5`;
  }

  return "לא צורף ציון כללי";
}

export function countActiveIncidents(incidents: IncidentRecord[]) {
  return incidents.filter((incident) => incident.status !== "resolved" && incident.status !== "dismissed").length;
}

export function calculateAverageResolutionMinutes(incidents: IncidentRecord[]) {
  const resolvedIncidents = incidents.filter((incident) => incident.resolvedAt);

  if (resolvedIncidents.length === 0) {
    return null;
  }

  const totalMinutes = resolvedIncidents.reduce((sum, incident) => {
    const openedAt = new Date(incident.openedAt).getTime();
    const resolvedAt = new Date(incident.resolvedAt ?? incident.updatedAt).getTime();

    return sum + Math.max(0, Math.round((resolvedAt - openedAt) / 60000));
  }, 0);

  return Math.round(totalMinutes / resolvedIncidents.length);
}
