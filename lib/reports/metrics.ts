import type { IncidentRecord, NotificationLogRecord, ScreenRecord } from "@/lib/data/types";

export const REPORTS_TIME_ZONE = "Asia/Jerusalem";

const reportDatePartsFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: REPORTS_TIME_ZONE,
  year: "numeric",
});

const reportHourFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  hourCycle: "h23",
  timeZone: REPORTS_TIME_ZONE,
});

export function getDateKeyInReportsTimeZone(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = reportDatePartsFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) return "";

  return `${year}-${month}-${day}`;
}

export function getHourInReportsTimeZone(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const hourPart = reportHourFormatter.formatToParts(date).find((part) => part.type === "hour")?.value ?? "00";
  const hour = Number(hourPart);

  return String(Number.isFinite(hour) ? hour % 24 : 0).padStart(2, "0");
}

export interface ReportFilters {
  startDate?: string | undefined; // YYYY-MM-DD
  endDate?: string | undefined;   // YYYY-MM-DD
  branchId?: string | undefined;
  restroomId?: string | undefined;
  screenId?: string | undefined;
  issueKey?: string | undefined;
  status?: string | undefined;
}

// Check if a date is on the same day as reference date in the reports timezone.
export function isSameDay(dateString: string, referenceDate: Date = new Date()): boolean {
  return getDateKeyInReportsTimeZone(dateString) === getDateKeyInReportsTimeZone(referenceDate);
}

// Check if a date is within the last 7 days from reference date
export function isWithinLastNDays(dateString: string, days: number, referenceDate: Date = new Date()): boolean {
  const date = new Date(dateString);
  const diffMs = referenceDate.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= days;
}

// Filter incidents by criteria
export function filterIncidents(incidents: IncidentRecord[], filters: ReportFilters): IncidentRecord[] {
  return incidents.filter((incident) => {
    if (filters.branchId && incident.branchId !== filters.branchId) return false;
    if (filters.restroomId && incident.restroomId !== filters.restroomId) return false;
    if (filters.screenId && incident.screenId !== filters.screenId) return false;
    if (filters.issueKey && incident.issueKey !== filters.issueKey) return false;
    if (filters.status && incident.status !== filters.status) return false;

    const openedDateKey = getDateKeyInReportsTimeZone(incident.openedAt);
    if (filters.startDate) {
      if (openedDateKey < filters.startDate) return false;
    }
    if (filters.endDate) {
      if (openedDateKey > filters.endDate) return false;
    }

    return true;
  });
}

// Calculate the duration in minutes between two ISO date strings
export function getDurationMinutes(startIso: string, endIso: string | null): number | null {
  if (!endIso) return null;
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return Math.max(0, Math.floor((end - start) / 60000));
}

// Calculate average of a number list
function average(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / values.length);
}

// Interface for general dashboard metrics
export interface DashboardMetrics {
  openNow: number;
  openedToday: number;
  openedLast7Days: number;
  avgResponseTimeTodayMinutes: number | null;
  avgResolutionTimeTodayMinutes: number | null;
  avgRatingToday: number | null;
  resolutionRateTodayPercentage: number;
  topIssueKeyToday: string | null;
  topRestroomOverallId: string | null;
}

export function calculateDashboardMetrics(
  incidents: IncidentRecord[],
  referenceDate: Date = new Date()
): DashboardMetrics {
  const openNow = incidents.filter(
    (inc) => inc.status === "open" || inc.status === "acknowledged" || inc.status === "in_progress"
  ).length;

  const todayIncidents = incidents.filter((inc) => isSameDay(inc.openedAt, referenceDate));
  const last7DaysIncidents = incidents.filter((inc) => isWithinLastNDays(inc.openedAt, 7, referenceDate));

  // Avg Response Time (Time to Acknowledge) for today's incidents
  const responseTimesToday = todayIncidents
    .map((inc) => getDurationMinutes(inc.openedAt, inc.acknowledgedAt))
    .filter((v): v is number => v !== null);
  const avgResponseTimeTodayMinutes = average(responseTimesToday);

  // Avg Resolution Time for today's incidents
  const resolutionTimesToday = todayIncidents
    .map((inc) => getDurationMinutes(inc.openedAt, inc.resolvedAt || inc.dismissedAt))
    .filter((v): v is number => v !== null);
  const avgResolutionTimeTodayMinutes = average(resolutionTimesToday);

  // Avg Rating for today's incidents
  const ratingsToday = todayIncidents.map((inc) => inc.rating).filter((r): r is (1 | 2 | 3 | 4 | 5) => r !== null);
  const avgRatingToday = ratingsToday.length > 0
    ? parseFloat((ratingsToday.reduce((acc, v) => acc + v, 0) / ratingsToday.length).toFixed(1))
    : null;

  // Resolution rate today
  const closedToday = todayIncidents.filter((inc) => inc.status === "resolved" || inc.status === "dismissed").length;
  const resolutionRateTodayPercentage = todayIncidents.length > 0
    ? Math.round((closedToday / todayIncidents.length) * 100)
    : 0;

  // Top issue type key today
  const issueCountsToday: Record<string, number> = {};
  for (const inc of todayIncidents) {
    if (inc.issueKey) {
      issueCountsToday[inc.issueKey] = (issueCountsToday[inc.issueKey] || 0) + 1;
    }
  }
  let topIssueKeyToday: string | null = null;
  let maxIssueCount = 0;
  for (const [key, count] of Object.entries(issueCountsToday)) {
    if (count > maxIssueCount) {
      maxIssueCount = count;
      topIssueKeyToday = key;
    }
  }

  // Top restroom overall (with most incidents)
  const restroomCounts: Record<string, number> = {};
  for (const inc of incidents) {
    restroomCounts[inc.restroomId] = (restroomCounts[inc.restroomId] || 0) + 1;
  }
  let topRestroomOverallId: string | null = null;
  let maxRestroomCount = 0;
  for (const [id, count] of Object.entries(restroomCounts)) {
    if (count > maxRestroomCount) {
      maxRestroomCount = count;
      topRestroomOverallId = id;
    }
  }

  return {
    openNow,
    openedToday: todayIncidents.length,
    openedLast7Days: last7DaysIncidents.length,
    avgResponseTimeTodayMinutes,
    avgResolutionTimeTodayMinutes,
    avgRatingToday,
    resolutionRateTodayPercentage,
    topIssueKeyToday,
    topRestroomOverallId,
  };
}

// Interface for advanced reports metrics
export interface ReportMetrics {
  totalCount: number;
  openCount: number;
  avgResponseTimeMinutes: number | null;
  avgResolutionTimeMinutes: number | null;
  avgRating: number | null;
  resolutionRatePercentage: number;
  topIssueKey: string | null;
  notificationSuccessRatePercentage: number;
}

export function calculateReportMetrics(
  incidents: IncidentRecord[],
  notificationLogs: NotificationLogRecord[]
): ReportMetrics {
  const totalCount = incidents.length;
  const openCount = incidents.filter(
    (inc) => inc.status === "open" || inc.status === "acknowledged" || inc.status === "in_progress"
  ).length;

  // Response times
  const responseTimes = incidents
    .map((inc) => getDurationMinutes(inc.openedAt, inc.acknowledgedAt))
    .filter((v): v is number => v !== null);
  const avgResponseTimeMinutes = average(responseTimes);

  // Resolution times
  const resolutionTimes = incidents
    .map((inc) => getDurationMinutes(inc.openedAt, inc.resolvedAt || inc.dismissedAt))
    .filter((v): v is number => v !== null);
  const avgResolutionTimeMinutes = average(resolutionTimes);

  // Ratings
  const ratings = incidents.map((inc) => inc.rating).filter((r): r is (1 | 2 | 3 | 4 | 5) => r !== null);
  const avgRating = ratings.length > 0
    ? parseFloat((ratings.reduce((acc, v) => acc + v, 0) / ratings.length).toFixed(1))
    : null;

  // Resolution rate
  const closedCount = incidents.filter((inc) => inc.status === "resolved" || inc.status === "dismissed").length;
  const resolutionRatePercentage = totalCount > 0 ? Math.round((closedCount / totalCount) * 100) : 0;

  // Top issue type
  const issueCounts: Record<string, number> = {};
  for (const inc of incidents) {
    if (inc.issueKey) {
      issueCounts[inc.issueKey] = (issueCounts[inc.issueKey] || 0) + 1;
    }
  }
  let topIssueKey: string | null = null;
  let maxIssueCount = 0;
  for (const [key, count] of Object.entries(issueCounts)) {
    if (count > maxIssueCount) {
      maxIssueCount = count;
      topIssueKey = key;
    }
  }

  // Notification success rate (mock_sent and sent are successes, failed is failure)
  const incidentIds = new Set(incidents.map((inc) => inc.id));
  const relevantLogs = notificationLogs.filter((log) => log.incidentId ? incidentIds.has(log.incidentId) : false);
  const attempts = relevantLogs.filter((log) => log.status !== "no_recipients");
  const successes = attempts.filter((log) => log.status === "sent" || log.status === "mock_sent");
  const notificationSuccessRatePercentage = attempts.length > 0
    ? Math.round((successes.length / attempts.length) * 100)
    : 100; // default to 100 if no notification attempts

  return {
    totalCount,
    openCount,
    avgResponseTimeMinutes,
    avgResolutionTimeMinutes,
    avgRating,
    resolutionRatePercentage,
    topIssueKey,
    notificationSuccessRatePercentage,
  };
}

// Group incidents by day (YYYY-MM-DD)
export function groupIncidentsByDay(incidents: IncidentRecord[]): { label: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const inc of incidents) {
    const day = getDateKeyInReportsTimeZone(inc.openedAt);
    counts[day] = (counts[day] || 0) + 1;
  }
  
  // Sort by date ascending
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, count]) => ({ label, count }));
}

// Group incidents by hour (00 to 23)
export function groupIncidentsByHour(incidents: IncidentRecord[]): { label: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (let i = 0; i < 24; i++) {
    const hourStr = String(i).padStart(2, "0") + ":00";
    counts[hourStr] = 0;
  }
  
  for (const inc of incidents) {
    const hourStr = `${getHourInReportsTimeZone(inc.openedAt)}:00`;
    counts[hourStr] = (counts[hourStr] || 0) + 1;
  }

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, count]) => ({ label, count }));
}

// Screen connectivity status calculator
export type ScreenStatus = "active" | "warning" | "inactive";

export function getScreenConnectivityStatus(screen: ScreenRecord, referenceDate: Date = new Date()): ScreenStatus {
  if (!screen.lastSeenAt) return "inactive";
  const diffMs = referenceDate.getTime() - new Date(screen.lastSeenAt).getTime();
  const diffMinutes = diffMs / 60000;
  if (diffMinutes <= 2) return "active";
  if (diffMinutes <= 15) return "warning";
  return "inactive";
}
