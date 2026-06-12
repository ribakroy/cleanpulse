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

export type EmailMode = "mock" | "test" | "live";

export type EmailDomainStatus = "not_configured" | "pending" | "verified";

export type MagicLoginPurpose =
  | "incident_alert"
  | "worker_task"
  | "shift_summary"
  | "user_invite"
  | "password_reset"
  | "system_notification"
  | "urgent_incident_alert"
  | "incident_resolved"
  | "restroom_reset";

export type BrandedEmailTemplateKey =
  | "incident_alert"
  | "urgent_incident_alert"
  | "worker_task_assigned"
  | "incident_resolved"
  | "restroom_reset"
  | "shift_summary"
  | "user_invite"
  | "password_reset";

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
