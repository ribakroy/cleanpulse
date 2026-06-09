import type {
  IncidentPriority,
  IncidentSource,
  IncidentStatus,
  NotificationChannel,
  NotificationLogStatus,
  NotificationProvider,
  NotificationScopeType,
  UserRole,
  IssueTypeKey,
  IssueSeverity,
} from "@/types/domain";

export type SortDirection = "asc" | "desc";

export type CollectionName =
  | "organizations"
  | "users"
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
  plan: "demo" | "basic" | "pro" | "enterprise";
  isActive: boolean;
};

export type UserRecord = TimestampedRecord & {
  organizationId: string;
  email: string;
  fullName: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
};

export type SafeUserRecord = Omit<UserRecord, "passwordHash">;

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
  incidentId: string;
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
  incidentId: string | null;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type CollectionRecordMap = {
  organizations: OrganizationRecord;
  users: UserRecord;
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
