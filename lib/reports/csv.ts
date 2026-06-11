import type {
  BranchRecord,
  IncidentRecord,
  IssueTypeRecord,
  NotificationLogRecord,
  RestroomRecord,
  ScreenRecord,
} from "@/lib/data/types";
import { formatDateTime } from "@/lib/utils/format";
import { getTimeToAcknowledgement, getTimeToResolution } from "@/lib/utils/sla";
import { createIssueTypeLabelMap, formatIncidentRatingSubtitle, formatIncidentTitle } from "@/lib/admin/presenters";

function escapeCsvValue(val: string | number | null | undefined): string {
  if (val === null || typeof val === "undefined") return "";
  const str = String(val);
  
  // Prevent CSV Formula Injection
  const firstChar = str.charAt(0);
  let safeStr = str;
  if (firstChar === "=" || firstChar === "+" || firstChar === "-" || firstChar === "@" || firstChar === "\t" || firstChar === "\r") {
    safeStr = "'" + str;
  }

  if (/[",\r\n]/.test(safeStr)) {
    return `"${safeStr.replace(/"/g, '""')}"`;
  }
  return safeStr;
}

export function generateIncidentsCsv(
  incidents: IncidentRecord[],
  branches: BranchRecord[],
  restrooms: RestroomRecord[],
  screens: ScreenRecord[],
  issueTypes: IssueTypeRecord[],
  notificationLogs: NotificationLogRecord[]
): string {
  // Maps for efficient lookups
  const branchNames = new Map(branches.map((b) => [b.id, b.name] as const));
  const restroomNames = new Map(restrooms.map((r) => [r.id, r.name] as const));
  const screenNames = new Map(screens.map((s) => [s.id, s.name] as const));
  const issueTypeLabels = createIssueTypeLabelMap(issueTypes);

  // Group notification logs by incidentId
  const logsByIncident = new Map<string, NotificationLogRecord[]>();
  for (const log of notificationLogs) {
    const list = logsByIncident.get(log.incidentId) || [];
    list.push(log);
    logsByIncident.set(log.incidentId, list);
  }

  // Helper for status translations
  const statusTranslations: Record<string, string> = {
    open: "פתוח",
    acknowledged: "התקבל",
    in_progress: "בטיפול",
    resolved: "טופל",
    dismissed: "נדחה",
  };

  // Helper for source translations
  const sourceTranslations: Record<string, string> = {
    kiosk: "טאבלט ציבורי",
    qr: "סריקת QR",
  };

  // Helper for notification status translation
  const getNotificationStatusLabel = (incidentId: string): string => {
    const logs = logsByIncident.get(incidentId) || [];
    if (logs.length === 0) return "אין התראות";
    if (logs.some((l) => l.status === "failed")) return "נכשל";
    if (logs.some((l) => l.status === "no_recipients")) return "אין נמענים";
    if (logs.some((l) => l.status === "mock_sent")) return "נשלח מדומה";
    if (logs.some((l) => l.status === "sent")) return "נשלח";
    return "לא ידוע";
  };

  // Headers (Hebrew)
  const headers = [
    "מזהה דיווח",
    "תאריך פתיחה",
    "סטטוס",
    "סניף",
    "אזור שירותים",
    "מסך",
    "מה דווח",
    "ציון כללי",
    "מקור",
    "זמן עד אישור (דק')",
    "זמן עד סגירה (דק')",
    "סטטוס התראה",
    "הערת לקוח",
    "הערת סגירה",
  ];

  const rows = [headers.map(escapeCsvValue).join(",")];

  for (const inc of incidents) {
    const title = formatIncidentTitle(inc, issueTypeLabels);
    const branchName = branchNames.get(inc.branchId) || "לא ידוע";
    const restroomName = restroomNames.get(inc.restroomId) || "לא ידוע";
    const screenName = screenNames.get(inc.screenId) || "לא ידוע";
    const statusLabel = statusTranslations[inc.status] || inc.status;
    const sourceLabel = sourceTranslations[inc.source] || inc.source;
    const timeToAck = getTimeToAcknowledgement(inc) || "טרם אושר";
    const timeToResolve = getTimeToResolution(inc) || "אירוע פתוח";
    const notifStatus = getNotificationStatusLabel(inc.id);

    const values = [
      inc.id,
      formatDateTime(inc.openedAt),
      statusLabel,
      branchName,
      restroomName,
      screenName,
      title,
      formatIncidentRatingSubtitle(inc),
      sourceLabel,
      timeToAck,
      timeToResolve,
      notifStatus,
      inc.customerNote || "",
      inc.resolutionNote || "",
    ];

    rows.push(values.map(escapeCsvValue).join(","));
  }

  // Prepend BOM (\uFEFF) for Excel Hebrew support
  return "\uFEFF" + rows.join("\n");
}
