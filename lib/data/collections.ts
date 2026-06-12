import type {
  CollectionName,
  CollectionRecordMap,
  DatePartitionedCollectionName,
  LogCollectionName,
} from "@/lib/data/types";

export type SoftDeleteStrategy = "isActive" | "enabled" | "unsupported";

type CollectionDefinition<C extends CollectionName> = {
  directory: string;
  datePartitioned: boolean;
  defaultSortField: Extract<keyof CollectionRecordMap[C], string>;
  softDeleteStrategy: SoftDeleteStrategy;
};

export const collectionDefinitions: { [K in CollectionName]: CollectionDefinition<K> } = {
  organizations: {
    directory: "organizations",
    datePartitioned: false,
    defaultSortField: "createdAt",
    softDeleteStrategy: "isActive",
  },
  users: {
    directory: "users",
    datePartitioned: false,
    defaultSortField: "createdAt",
    softDeleteStrategy: "isActive",
  },
  shifts: {
    directory: "shifts",
    datePartitioned: false,
    defaultSortField: "createdAt",
    softDeleteStrategy: "isActive",
  },
  magic_login_tokens: {
    directory: "magic_login_tokens",
    datePartitioned: false,
    defaultSortField: "createdAt",
    softDeleteStrategy: "unsupported",
  },
  system_settings: {
    directory: "system_settings",
    datePartitioned: false,
    defaultSortField: "updatedAt",
    softDeleteStrategy: "unsupported",
  },
  branches: {
    directory: "branches",
    datePartitioned: false,
    defaultSortField: "createdAt",
    softDeleteStrategy: "isActive",
  },
  restrooms: {
    directory: "restrooms",
    datePartitioned: false,
    defaultSortField: "createdAt",
    softDeleteStrategy: "isActive",
  },
  screens: {
    directory: "screens",
    datePartitioned: false,
    defaultSortField: "createdAt",
    softDeleteStrategy: "isActive",
  },
  issue_types: {
    directory: "issue_types",
    datePartitioned: false,
    defaultSortField: "sortOrder",
    softDeleteStrategy: "isActive",
  },
  incidents: {
    directory: "incidents",
    datePartitioned: true,
    defaultSortField: "createdAt",
    softDeleteStrategy: "unsupported",
  },
  notification_recipients: {
    directory: "notification_recipients",
    datePartitioned: false,
    defaultSortField: "createdAt",
    softDeleteStrategy: "enabled",
  },
  notification_logs: {
    directory: "notification_logs",
    datePartitioned: true,
    defaultSortField: "createdAt",
    softDeleteStrategy: "unsupported",
  },
  activity_logs: {
    directory: "activity_logs",
    datePartitioned: true,
    defaultSortField: "createdAt",
    softDeleteStrategy: "unsupported",
  },
};

export function isDatePartitionedCollection(collection: CollectionName): collection is DatePartitionedCollectionName {
  return collectionDefinitions[collection].datePartitioned;
}

export function isLogCollection(collection: CollectionName): collection is LogCollectionName {
  return collection === "notification_logs" || collection === "activity_logs";
}
