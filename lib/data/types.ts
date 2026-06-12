import type {
  IncidentPriority,
  IncidentSource,
  IncidentStatus,
  NotificationChannel,
  NotificationLogStatus,
  NotificationProvider,
  NotificationScopeType,
  EmailDomainStatus,
  EmailMode,
  MagicLoginPurpose,
  DetectedShiftConfidence,
  DetectedShiftStatus,
  UserRole,
  IssueTypeKey,
  IssueSeverity,
} from "@/types/domain";

export type SortDirection = "asc" | "desc";

export type ClosingResetMode = "reset_open_incidents" | "keep_open_incidents";

export type CollectionName =
  | "organizations"
  | "users"
  | "shifts"
  | "detected_shifts"
  | "magic_login_tokens"
  | "system_settings"
  | "branches"
  | "restrooms"
  | "screens"
  | "issue_types"
  | "incidents"
  | "notification_recipients"
  | "notification_logs"
  | "activity_logs";

export type LogCollectionName = "notification_logs" | "activity_logs";

export type DatePartitionedCollectionName = "incidents" | "notification_logs" | "activity_logs";

export type CollectionRecordBase = {
  id: string;
};

export type TimestampedRecord = CollectionRecordBase & {
  createdAt: string;
  updatedAt: string;
};

export type OrganizationRecord = TimestampedRecord & {
  name: string;
  slug: string;
  plan: "demo" | "basic" | "pro" | "enterprise" | "free" | "starter";
  isActive: boolean;
  status?: "active" | "trial" | "suspended" | "cancelled";
  billingStatus?: "active" | "trialing" | "past_due" | "cancelled" | "manual";
  billingEmail?: string;
  companyName?: string;
  contactName?: string;
  contactPhone?: string;
  trialEndsAt?: string;
  notes?: string;
  allowedScreensLimit?: number;
  monthlyPrice?: number;
  currency?: string;
  closingTime?: string | undefined;
  closingResetMode?: ClosingResetMode | undefined;
};

export type UserRecord = TimestampedRecord & {
  organizationId: string;
  email: string;
  fullName: string;
  passwordHash: string;
  role: UserRole;
  isActive?: boolean | undefined;
  allowedBranchIds?: string[] | undefined;
  allowedRestroomIds?: string[] | undefined;
  assignedRestroomIds?: string[] | undefined;
  phone?: string | undefined;
  jobTitle?: string | undefined;
  employeeCode?: string | undefined;
  defaultShiftId?: string | undefined;
  lastSeenAt?: string | undefined;
};

export type SafeUserRecord = Omit<UserRecord, "passwordHash">;

export type ShiftRecord = TimestampedRecord & {
  organizationId: string;
  branchId?: string | undefined;
  restroomIds?: string[] | undefined;
  assignedUserIds?: string[] | undefined;
  name: string;
  startsAt: string;
  endsAt: string;
  daysOfWeek?: number[] | undefined;
  isActive: boolean;
};

export type DetectedShiftRecord = TimestampedRecord & {
  organizationId: string;
  branchId?: string | undefined;
  restroomIds?: string[] | undefined;
  assignedUserIds?: string[] | undefined;
  managerUserId?: string | undefined;
  inferredStartAt?: string | undefined;
  inferredEndAt?: string | undefined;
  confirmedStartAt?: string | undefined;
  confirmedEndAt?: string | undefined;
  shiftName?: string | undefined;
  daysOfWeek?: number[] | undefined;
  source: "detected";
  status: DetectedShiftStatus;
  missingFields: string[];
  confidence?: DetectedShiftConfidence | undefined;
  createdFromActivityLogIds?: string[] | undefined;
  completionRequestedAt?: string | undefined;
  completionRequestedToUserIds?: string[] | undefined;
  confirmedByUserId?: string | undefined;
  confirmedAt?: string | undefined;
  dismissedByUserId?: string | undefined;
  dismissedAt?: string | undefined;
};

export type MagicLoginTokenRecord = TimestampedRecord & {
  organizationId: string;
  userId: string;
  tokenHash: string;
  targetPath: string;
  purpose: MagicLoginPurpose;
  expiresAt: string;
  usedAt?: string | undefined;
  revokedAt?: string | undefined;
  createdByUserId?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
};

export type EmailDomainSettingsRecord = TimestampedRecord & {
  appUrl: string;
  emailProvider: NotificationProvider;
  emailMode: EmailMode;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string | undefined;
  allowedTestRecipients?: string[] | undefined;
  domainStatus?: EmailDomainStatus | undefined;
  resendDomain?: string | undefined;
  updatedByUserId: string;
};

export type BranchRecord = TimestampedRecord & {
  organizationId: string;
  name: string;
  address: string;
  city: string;
  isActive: boolean;
};

export type RestroomRecord = TimestampedRecord & {
  organizationId: string;
  branchId: string;
  name: string;
  floor: string;
  areaDescription: string;
  isActive: boolean;
};

export type ScreenRecord = TimestampedRecord & {
  organizationId: string;
  branchId: string;
  restroomId: string;
  name: string;
  publicToken: string;
  qrToken: string;
  isActive: boolean;
  lastSeenAt: string | null;
};

export type IssueTypeRecord = CollectionRecordBase & {
  key: IssueTypeKey;
  labelHe: string;
  icon: string;
  severity: IssueSeverity;
  isActive: boolean;
  sortOrder: number;
};

export type IncidentRecord = TimestampedRecord & {
  organizationId: string;
  branchId: string;
  restroomId: string;
  screenId: string;
  issueTypeId: string | null;
  issueKey: IssueTypeKey | null;
  rating: 1 | 2 | 3 | 4 | 5 | null;
  status: IncidentStatus;
  priority: IncidentPriority;
  customerNote: string | null;
  openedAt: string;
  acknowledgedAt: string | null;
  inProgressAt: string | null;
  resolvedAt: string | null;
  dismissedAt: string | null;
  assignedToUserId: string | null;
  resolvedByUserId: string | null;
  resolutionNote: string | null;
  source: IncidentSource;
};

export type NotificationRecipientRecord = TimestampedRecord & {
  organizationId: string;
  scopeType: NotificationScopeType;
  scopeId: string;
  name: string;
  email: string;
  enabled: boolean;
};

export type NotificationLogRecord = CollectionRecordBase & {
  organizationId: string;
  incidentId: string | null;
  targetType?: string | undefined;
  targetId?: string | undefined;
  recipientId: string | null;
  provider: NotificationProvider;
  channel: NotificationChannel;
  status: NotificationLogStatus;
  providerMessageId: string | null;
  errorMessage: string | null;
  createdAt: string;
};

export type ActivityLogRecord = CollectionRecordBase & {
  organizationId: string;
  actorUserId: string | null;
  actorFullName?: string | null | undefined;
  actorRole?: UserRole | null | undefined;
  incidentId: string | null;
  action: string;
  actionType?: string | undefined;
  targetType?: string | undefined;
  targetId?: string | undefined;
  restroomId?: string | undefined;
  branchId?: string | undefined;
  shiftId?: string | undefined;
  detectedShiftId?: string | undefined;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type CollectionRecordMap = {
  organizations: OrganizationRecord;
  users: UserRecord;
  shifts: ShiftRecord;
  detected_shifts: DetectedShiftRecord;
  magic_login_tokens: MagicLoginTokenRecord;
  system_settings: EmailDomainSettingsRecord;
  branches: BranchRecord;
  restrooms: RestroomRecord;
  screens: ScreenRecord;
  issue_types: IssueTypeRecord;
  incidents: IncidentRecord;
  notification_recipients: NotificationRecipientRecord;
  notification_logs: NotificationLogRecord;
  activity_logs: ActivityLogRecord;
};

export type CollectionRecord<C extends CollectionName> = CollectionRecordMap[C];

export type CollectionFieldName<C extends CollectionName> = Extract<keyof CollectionRecord<C>, string>;

type ScalarFilterValue<T> = T extends Array<infer U> ? U : T;

export type QueryFilter<C extends CollectionName> = {
  [K in keyof CollectionRecord<C>]?: ScalarFilterValue<CollectionRecord<C>[K]> | Array<ScalarFilterValue<CollectionRecord<C>[K]>> | undefined;
} & {
  includeInactive?: boolean | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  limit?: number | undefined;
  sortBy?: CollectionFieldName<C> | undefined;
  sortDirection?: SortDirection | undefined;
};

export type ListOptions<C extends CollectionName> = {
  includeInactive?: boolean | undefined;
  limit?: number | undefined;
  sortBy?: CollectionFieldName<C> | undefined;
  sortDirection?: SortDirection | undefined;
};

export type UpdatePatch<C extends CollectionName> = Partial<Omit<CollectionRecord<C>, "id" | "createdAt">>;

export type AdapterDescriptor = {
  mode: "local" | "github";
  repository: string;
  rootPath: string;
};
