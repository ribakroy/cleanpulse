import type { UserRole } from "@/types/domain";

export const teamReportRoleFilterOptions: UserRole[] = [
  "owner",
  "admin",
  "area_manager",
  "operations_worker",
  "manager",
  "cleaner",
];

export const teamReportShiftLinkOptions = new Set([
  "confirmed",
  "detected",
  "needs_completion",
  "no_shift",
]);

export const teamReportActionLabels: Record<string, string> = {
  status_acknowledged: "אישור קבלה",
  status_in_progress: "התחלת טיפול",
  status_resolved: "סגירת טיפול",
  status_dismissed: "דחיית דיווח",
  restroom_reset: "ניקוי מקיף",
  worker_note: "הערת עובד",
  closing_reset_run: "איפוס סוף יום",
  settings_changed: "שינוי הגדרות",
  user_created: "יצירת משתמש",
  user_updated: "עדכון משתמש",
  user_disabled: "השבתת משתמש",
  user_password_reset: "איפוס סיסמה",
  shift_created: "יצירת משמרת",
  shift_updated: "עדכון משמרת",
  shift_disabled: "השבתת משמרת",
  user_login: "כניסה למערכת",
  work_portal_viewed: "כניסה לאזור עבודה",
  detected_shift_created: "זיהוי משמרת",
  detected_shift_updated: "עדכון זיהוי משמרת",
  detected_shift_completion_requested: "בקשת השלמת משמרת",
  detected_shift_confirmed: "אישור משמרת שזוהתה",
  detected_shift_dismissed: "דחיית משמרת שזוהתה",
};

export function normalizeTeamReportDate(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return trimmed;

  const localMatch = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!localMatch) return "";

  return `${localMatch[3]}-${localMatch[2]!.padStart(2, "0")}-${localMatch[1]!.padStart(2, "0")}`;
}

export function formatTeamReportDateForInput(value: string | undefined) {
  const normalized = normalizeTeamReportDate(value);
  if (!normalized) return value || "";
  const [year, month, day] = normalized.split("-");
  return `${day}/${month}/${year}`;
}

export function isLogInTeamReportDateRange(logDate: string, startDate: string, endDate: string) {
  const timestamp = new Date(logDate).getTime();

  if (startDate && timestamp < new Date(`${startDate}T00:00:00`).getTime()) {
    return false;
  }

  if (endDate && timestamp > new Date(`${endDate}T23:59:59`).getTime()) {
    return false;
  }

  return true;
}

export function getDetectedShiftStatusLabel(status: string | undefined) {
  if (status === "confirmed") return "משמרת שזוהתה ואושרה";
  if (status === "needs_completion") return "משמרת שזוהתה - דורשת השלמה";
  if (status === "dismissed") return "משמרת שזוהתה - נדחתה";
  if (status === "draft") return "משמרת שזוהתה";
  return "משמרת שזוהתה";
}

export function getShiftLinkLabel(input: {
  shiftId?: string | undefined;
  detectedShiftId?: string | undefined;
  detectedStatus?: string | undefined;
}) {
  if (input.shiftId) return "משמרת ידנית";
  if (input.detectedShiftId) return getDetectedShiftStatusLabel(input.detectedStatus);
  return "ללא שיוך משמרת";
}

export function matchesShiftLinkFilter(input: {
  shiftId?: string | undefined;
  detectedShiftId?: string | undefined;
  detectedStatus?: string | undefined;
}, filter: string) {
  if (!filter) return true;
  if (filter === "confirmed") return Boolean(input.shiftId || input.detectedStatus === "confirmed");
  if (filter === "detected") return Boolean(input.detectedShiftId);
  if (filter === "needs_completion") return input.detectedStatus === "needs_completion";
  if (filter === "no_shift") return !input.shiftId && !input.detectedShiftId;
  return true;
}
