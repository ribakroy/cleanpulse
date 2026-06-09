import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import type { DataAdapter } from "@/lib/data/adapter";
import { collectionDefinitions } from "@/lib/data/collections";
import { DataLayerError, getErrorMessage } from "@/lib/data/errors";
import { isRecordVisible, matchesQueryFilter, sortRecords, withTouchedUpdatedAt } from "@/lib/data/query-utils";
import { getCollectionDirectory, getRecordRelativePath, getStorageRootPrefix } from "@/lib/data/storage-paths";
import type {
  AdapterDescriptor,
  CollectionName,
  CollectionRecord,
  ListOptions,
  LogCollectionName,
  QueryFilter,
  UpdatePatch,
} from "@/lib/data/types";

export class LocalFileDataAdapter implements DataAdapter {
  readonly mode = "local" as const;
  private readonly rootDirectory = resolve(process.cwd(), "data-local");

  describe(): AdapterDescriptor {
    return {
      mode: this.mode,
      repository: "local-filesystem",
      rootPath: join(this.rootDirectory, getStorageRootPrefix()),
    };
  }

  async list<C extends CollectionName>(collection: C, options?: ListOptions<C>) {
    const records = await this.readAllRecords(collection);
    const sortBy = options?.sortBy ?? collectionDefinitions[collection].defaultSortField;
    const sortDirection = options?.sortDirection ?? "desc";
    const visibleRecords = records.filter((record) => isRecordVisible(collection, record, options?.includeInactive ?? false));
    const sortedRecords = sortRecords(visibleRecords, sortBy, sortDirection);

    return typeof options?.limit === "number" ? sortedRecords.slice(0, options.limit) : sortedRecords;
  }

  async get<C extends CollectionName>(collection: C, id: string) {
    this.assertSafeRuntime();
    const recordPath = await this.findRecordPath(collection, id);

    if (!recordPath) {
      return null;
    }

    return this.readRecordFile<C>(recordPath);
  }

  async create<C extends CollectionName>(collection: C, record: CollectionRecord<C>) {
    this.assertSafeRuntime();
    const existingPath = await this.findRecordPath(collection, record.id);

    if (existingPath) {
      throw new DataLayerError(
        "LOCAL_RECORD_EXISTS",
        `Record "${record.id}" already exists in collection "${collection}".`,
      );
    }

    const normalizedRecord = this.ensureTimestamps(record);
    const absolutePath = this.resolveRelativePath(getRecordRelativePath(collection, normalizedRecord));

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, `${JSON.stringify(normalizedRecord, null, 2)}\n`, "utf8");

    return normalizedRecord;
  }

  async update<C extends CollectionName>(collection: C, id: string, patch: UpdatePatch<C>) {
    this.assertSafeRuntime();
    const recordPath = await this.findRecordPath(collection, id);

    if (!recordPath) {
      throw new DataLayerError("LOCAL_RECORD_NOT_FOUND", `Record "${id}" was not found in "${collection}".`);
    }

    const currentRecord = await this.readRecordFile<C>(recordPath);
    const nextRecord = withTouchedUpdatedAt(
      {
        ...currentRecord,
        ...patch,
      } as CollectionRecord<C>,
      new Date().toISOString(),
    );

    await writeFile(recordPath, `${JSON.stringify(nextRecord, null, 2)}\n`, "utf8");

    return nextRecord;
  }

  async softDelete<C extends CollectionName>(collection: C, id: string) {
    const strategy = collectionDefinitions[collection].softDeleteStrategy;

    if (strategy === "unsupported") {
      throw new DataLayerError(
        "LOCAL_SOFT_DELETE_UNSUPPORTED",
        `Collection "${collection}" does not support soft delete.`,
      );
    }

    if (strategy === "isActive") {
      return this.update(collection, id, { isActive: false } as unknown as UpdatePatch<C>);
    }

    if (strategy === "enabled") {
      return this.update(collection, id, { enabled: false } as unknown as UpdatePatch<C>);
    }

    throw new DataLayerError("LOCAL_SOFT_DELETE_INVALID", `Unsupported soft delete strategy for "${collection}".`);
  }

  async query<C extends CollectionName>(collection: C, filter?: QueryFilter<C>) {
    this.assertSafeRuntime();
    const records = await this.readAllRecords(collection);
    const matchingRecords = records.filter((record) => matchesQueryFilter(collection, record, filter));
    const sortBy = filter?.sortBy ?? collectionDefinitions[collection].defaultSortField;
    const sortDirection = filter?.sortDirection ?? "desc";
    const sortedRecords = sortRecords(matchingRecords, sortBy, sortDirection);

    return typeof filter?.limit === "number" ? sortedRecords.slice(0, filter.limit) : sortedRecords;
  }

  async appendLog<C extends LogCollectionName>(collection: C, record: CollectionRecord<C>) {
    return this.create(collection, record);
  }

  private assertSafeRuntime() {
    if (process.env.NODE_ENV === "production") {
      throw new DataLayerError(
        "LOCAL_ADAPTER_PRODUCTION_BLOCKED",
        "DATA_ADAPTER=local is blocked in production. Switch to DATA_ADAPTER=github before deploying.",
      );
    }
  }

  private ensureTimestamps<C extends CollectionName>(record: CollectionRecord<C>) {
    const createdAt = "createdAt" in record ? record.createdAt || new Date().toISOString() : undefined;

    if ("updatedAt" in record) {
      return {
        ...record,
        createdAt: createdAt ?? new Date().toISOString(),
        updatedAt: record.updatedAt || createdAt || new Date().toISOString(),
      } as CollectionRecord<C>;
    }

    if ("createdAt" in record) {
      return {
        ...record,
        createdAt: createdAt ?? new Date().toISOString(),
      } as CollectionRecord<C>;
    }

    return record;
  }

  private async readAllRecords<C extends CollectionName>(collection: C) {
    this.assertSafeRuntime();
    const filePaths = await this.collectCollectionFiles(collection);
    const records = await Promise.all(filePaths.map((filePath) => this.readRecordFile<C>(filePath)));

    return records;
  }

  private async collectCollectionFiles(collection: CollectionName) {
    const collectionDirectory = this.resolveRelativePath(getCollectionDirectory(collection));
    const filePaths: string[] = [];
    const exists = await this.pathExists(collectionDirectory);

    if (!exists) {
      return filePaths;
    }

    const stack = [collectionDirectory];

    while (stack.length > 0) {
      const currentPath = stack.pop();

      if (!currentPath) {
        continue;
      }

      const entries = await readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = join(currentPath, entry.name);

        if (entry.isDirectory()) {
          stack.push(entryPath);
          continue;
        }

        if (entry.isFile() && entry.name.endsWith(".json")) {
          filePaths.push(entryPath);
        }
      }
    }

    return filePaths;
  }

  private async findRecordPath(collection: CollectionName, id: string) {
    const directPath = this.resolveRelativePath(
      `${getCollectionDirectory(collection)}/${id}.json`,
    );

    if (await this.pathExists(directPath)) {
      return directPath;
    }

    const filePaths = await this.collectCollectionFiles(collection);

    return filePaths.find((filePath) => filePath.endsWith(`/${id}.json`)) ?? null;
  }

  private async readRecordFile<C extends CollectionName>(absolutePath: string) {
    try {
      const fileContent = await readFile(absolutePath, "utf8");

      return JSON.parse(fileContent) as CollectionRecord<C>;
    } catch (error) {
      throw new DataLayerError(
        "LOCAL_RECORD_READ_FAILED",
        `Failed to read JSON file "${absolutePath}": ${getErrorMessage(error)}`,
        { cause: error },
      );
    }
  }

  private resolveRelativePath(relativePath: string) {
    return join(this.rootDirectory, relativePath);
  }

  private async pathExists(pathToCheck: string) {
    try {
      await stat(pathToCheck);
      return true;
    } catch {
      return false;
    }
  }
}
