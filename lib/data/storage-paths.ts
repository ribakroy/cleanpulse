import { collectionDefinitions, isDatePartitionedCollection } from "@/lib/data/collections";
import type { CollectionName } from "@/lib/data/types";

const DATA_DIRECTORY = "data";

export function getStorageRootPrefix() {
  return DATA_DIRECTORY;
}

export function getCollectionDirectory(collection: CollectionName) {
  return `${DATA_DIRECTORY}/${collectionDefinitions[collection].directory}`;
}

export function getPartitionPath(isoDate: string) {
  const date = new Date(isoDate);
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  return `${year}/${month}`;
}

export function getRecordRelativePath<C extends CollectionName>(
  collection: C,
  record: { id: string; createdAt?: string | undefined },
) {
  const baseDirectory = getCollectionDirectory(collection);

  if (!isDatePartitionedCollection(collection)) {
    return `${baseDirectory}/${record.id}.json`;
  }

  const createdAt = record.createdAt;

  if (!createdAt) {
    throw new Error(`Record in collection "${collection}" requires createdAt for path resolution.`);
  }

  return `${baseDirectory}/${getPartitionPath(createdAt)}/${record.id}.json`;
}
