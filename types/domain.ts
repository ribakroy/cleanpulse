export type UserRole =
  | "super_admin"
  | "owner"
  | "admin"
  | "area_manager"
  | "operations_worker"
  | "manager"
  | "cleaner";

export type IncidentStatus = "open" | "acknowledged" | "in_progress" | "resolved" | "dismissed";

export type IncidentPriority = "low" | "medium" | "high" | "critical";

export type IssueSeverity = "low" | "medium" | "high" | "critical";

export type NotificationProvider = "mock" | "resend";

export type NotificationLogStatus = "queued" | "sent" | "failed" | "mock_sent" | "no_recipients";

export type NotificationChannel = "email";

export type NotificationScopeType = "organization" | "branch" | "restroom" | "screen";

export type IncidentSource = "kiosk" | "qr";

export type IssueTypeKey =
  | "missing_paper"
  | "missing_soap"
  | "not_clean"
  | "bad_smell"
  | "trash_full"
  | "toilet_fault"
  | "sink_fault"
  | "dirty_floor";

export type IssueTypeSeed = {
  id: string;
  key: IssueTypeKey;
  labelHe: string;
  icon: string;
  severity: IssueSeverity;
  isActive: boolean;
  sortOrder: number;
};
