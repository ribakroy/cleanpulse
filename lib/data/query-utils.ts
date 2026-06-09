import { isDeepStrictEqual } from "node:util";
import { collectionDefinitions } from "@/lib/data/collections";
import type { CollectionName, CollectionRecord, QueryFilter, SortDirection } from "@/lib/data/types";

const reservedFilterKeys = new Set(["includeInactive", "dateFrom", "dateTo", "limit", "sortBy", "sortDirection"]);

function compareValues(recordValue: unknown, filterValue: unknown): boolean {
  if (Array.isArray(filterValue)) {
    return filterValue.some((candidate): boolean => compareValues(recordValue, candidate));
  }

  if (filterValue instanceof Date) {
    return String(recordValue) === filterValue.toISOString();
  }

  if (filterValue && typeof filterValue === "object") {
    return isDeepStrictEqual(recordValue, filterValue);
  }

  if (typeof recordValue === "string" && typeof filterValue === "string") {
    return recordValue === filterValue;
  }

  return recordValue === filterValue;
}

export function isRecordVisible<C extends CollectionName>(
  collection: C,
  record: CollectionRecord<C>,
  includeInactive = false,
) {
  if (includeInactive) {
    return true;
  }

  const strategy = collectionDefinitions[collection].softDeleteStrategy;

  if (strategy === "isActive" && "isActive" in record) {
    return Boolean(record.isActive);
  }

  if (strategy === "enabled" && "enabled" in record) {
    return Boolean(record.enabled);
  }

  return true;
}

export function matchesQueryFilter<C extends CollectionName>(
  collection: C,
  record: CollectionRecord<C>,
  filter?: QueryFilter<C>,
) {
  if (!filter) {
    return true;
  }

  if (!isRecordVisible(collection, record, filter.includeInactive ?? false)) {
    return false;
  }

  if (filter.dateFrom || filter.dateTo) {
    const recordDate = "createdAt" in record ? new Date(record.createdAt).getTime() : null;

    if (recordDate !== null && filter.dateFrom && recordDate < new Date(filter.dateFrom).getTime()) {
      return false;
    }

    if (recordDate !== null && filter.dateTo && recordDate > new Date(filter.dateTo).getTime()) {
      return false;
    }
  }

  for (const [rawKey, filterValue] of Object.entries(filter)) {
    if (reservedFilterKeys.has(rawKey) || typeof filterValue === "undefined") {
      continue;
    }

    const key = rawKey as keyof CollectionRecord<C>;
    const recordValue = record[key];

    if (!compareValues(recordValue, filterValue)) {
      return false;
    }
  }

  return true;
}

export function sortRecords<C extends CollectionName>(
  records: Array<CollectionRecord<C>>,
  sortBy: Extract<keyof CollectionRecord<C>, string>,
  direction: SortDirection,
) {
  return [...records].sort((left, right) => {
    const leftValue = left[sortBy];
    const rightValue = right[sortBy];

    if (leftValue === rightValue) {
      return 0;
    }

    if (leftValue === null || typeof leftValue === "undefined") {
      return direction === "asc" ? -1 : 1;
    }

    if (rightValue === null || typeof rightValue === "undefined") {
      return direction === "asc" ? 1 : -1;
    }

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return direction === "asc" ? leftValue - rightValue : rightValue - leftValue;
    }

    const leftString = String(leftValue);
    const rightString = String(rightValue);

    return direction === "asc"
      ? leftString.localeCompare(rightString, "he")
      : rightString.localeCompare(leftString, "he");
  });
}

export function withTouchedUpdatedAt<C extends CollectionName>(
  record: CollectionRecord<C>,
  updatedAt: string,
): CollectionRecord<C> {
  if ("updatedAt" in record) {
    return {
      ...record,
      updatedAt,
    };
  }

  return record;
}
