import { Buffer } from "node:buffer";
import type { DataAdapter } from "@/lib/data/adapter";
import { collectionDefinitions } from "@/lib/data/collections";
import { DataLayerError, getErrorMessage } from "@/lib/data/errors";
import { getGitHubDataRepoConfig } from "@/lib/github/config";
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

type GitHubContentFile = {
  path: string;
  sha: string;
  content?: string;
  encoding?: string;
};

type GitHubTreeItem = {
  path: string;
  type: "blob" | "tree";
  sha: string;
};

type GitHubBranchPayload = {
  commit: {
    commit: {
      tree: {
        sha: string;
      };
    };
  };
};

type GitHubDataRepoConfig = ReturnType<typeof getGitHubDataRepoConfig>;
type GitHubReadCacheEntry<T> = {
  expiresAt: number;
  promise: Promise<T>;
};

const GITHUB_READ_CACHE_TTL_MS = 60_000;
const repositoryTreeCache = new Map<string, GitHubReadCacheEntry<GitHubTreeItem[]>>();
const contentFileCache = new Map<string, GitHubReadCacheEntry<GitHubContentFile | null>>();

function getCachedGitHubRead<T>(
  cache: Map<string, GitHubReadCacheEntry<T>>,
  key: string,
  loader: () => Promise<T>,
) {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && cached.expiresAt > now) {
    return cached.promise;
  }

  const promise = loader().catch((error) => {
    if (cache.get(key)?.promise === promise) {
      cache.delete(key);
    }

    throw error;
  });

  cache.set(key, {
    expiresAt: now + GITHUB_READ_CACHE_TTL_MS,
    promise,
  });

  return promise;
}

export class GitHubDataAdapter implements DataAdapter {
  readonly mode = "github" as const;

  describe(): AdapterDescriptor {
    const config = getGitHubDataRepoConfig();

    return {
      mode: this.mode,
      repository: `${config.owner}/${config.repo}:${config.branch}`,
      rootPath: getStorageRootPrefix(),
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
    const descriptor = await this.findRecordDescriptor(collection, id);

    if (!descriptor) {
      return null;
    }

    return this.readJsonRecord<C>(descriptor.path);
  }

  async create<C extends CollectionName>(collection: C, record: CollectionRecord<C>) {
    const existingRecord = await this.findRecordDescriptor(collection, record.id);

    if (existingRecord) {
      throw new DataLayerError(
        "GITHUB_RECORD_EXISTS",
        `Record "${record.id}" already exists in "${collection}" in the GitHub data repo.`,
      );
    }

    const normalizedRecord = this.ensureTimestamps(record);
    const recordPath = getRecordRelativePath(collection, normalizedRecord);

    await this.writeJsonRecord(recordPath, normalizedRecord, {
      message: `Create ${collection}/${record.id}`,
    });

    return normalizedRecord;
  }

  async update<C extends CollectionName>(collection: C, id: string, patch: UpdatePatch<C>) {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const descriptor = await this.findRecordDescriptor(collection, id);

      if (!descriptor) {
        throw new DataLayerError("GITHUB_RECORD_NOT_FOUND", `Record "${id}" was not found in "${collection}".`);
      }

      const currentRecord = await this.readJsonRecord<C>(descriptor.path);
      const nextRecord = withTouchedUpdatedAt(
        {
          ...currentRecord,
          ...patch,
        } as CollectionRecord<C>,
        new Date().toISOString(),
      );

      try {
        await this.writeJsonRecord(descriptor.path, nextRecord, {
          message: `Update ${collection}/${id}`,
          sha: descriptor.sha,
        });

        return nextRecord;
      } catch (error) {
        if (!(error instanceof DataLayerError) || error.code !== "GITHUB_WRITE_CONFLICT" || attempt === maxAttempts) {
          throw error;
        }
      }
    }

    throw new DataLayerError("GITHUB_UPDATE_RETRY_EXHAUSTED", `Failed to update record "${id}" in "${collection}".`);
  }

  async softDelete<C extends CollectionName>(collection: C, id: string) {
    const strategy = collectionDefinitions[collection].softDeleteStrategy;

    if (strategy === "unsupported") {
      throw new DataLayerError(
        "GITHUB_SOFT_DELETE_UNSUPPORTED",
        `Collection "${collection}" does not support soft delete.`,
      );
    }

    if (strategy === "isActive") {
      return this.update(collection, id, { isActive: false } as unknown as UpdatePatch<C>);
    }

    if (strategy === "enabled") {
      return this.update(collection, id, { enabled: false } as unknown as UpdatePatch<C>);
    }

    throw new DataLayerError("GITHUB_SOFT_DELETE_INVALID", `Unsupported soft delete strategy for "${collection}".`);
  }

  async query<C extends CollectionName>(collection: C, filter?: QueryFilter<C>) {
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

  private ensureServerSide() {
    if (typeof window !== "undefined") {
      throw new DataLayerError(
        "GITHUB_SERVER_ONLY",
        "GitHubDataAdapter can run only on the server side. The GitHub token must never be exposed to the client.",
      );
    }
  }

  private getRuntimeConfig() {
    this.ensureServerSide();
    const config = getGitHubDataRepoConfig();

    if (!config.owner || !config.repo || !config.branch || !config.token) {
      throw new DataLayerError(
        "GITHUB_ENV_MISSING",
        "Missing one or more required GitHub data env vars: GITHUB_DATA_OWNER, GITHUB_DATA_REPO, GITHUB_DATA_BRANCH, GITHUB_DATA_TOKEN.",
      );
    }

    return config;
  }

  private getRepositoryCacheKey(config: GitHubDataRepoConfig) {
    return `${config.owner}/${config.repo}:${config.branch}`;
  }

  private clearRepositoryReadCache(config: GitHubDataRepoConfig) {
    const repositoryKey = this.getRepositoryCacheKey(config);

    for (const key of repositoryTreeCache.keys()) {
      if (key.startsWith(repositoryKey)) {
        repositoryTreeCache.delete(key);
      }
    }

    for (const key of contentFileCache.keys()) {
      if (key.startsWith(repositoryKey)) {
        contentFileCache.delete(key);
      }
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
    const descriptors = await this.listCollectionDescriptors(collection);
    const records = await Promise.all(descriptors.map((descriptor) => this.readJsonRecord<C>(descriptor.path)));

    return records;
  }

  private async listCollectionDescriptors(collection: CollectionName) {
    const tree = await this.listRepositoryTree();
    const prefix = `${getCollectionDirectory(collection)}/`;

    return tree.filter((item) => item.type === "blob" && item.path.startsWith(prefix) && item.path.endsWith(".json"));
  }

  private async findRecordDescriptor(collection: CollectionName, id: string) {
    const directPath = `${getCollectionDirectory(collection)}/${id}.json`;
    const directFile = await this.readContentFile(directPath, { allowNotFound: true });

    if (directFile) {
      return {
        path: directPath,
        sha: directFile.sha,
      };
    }

    const descriptors = await this.listCollectionDescriptors(collection);
    const match = descriptors.find((descriptor) => descriptor.path.endsWith(`/${id}.json`));

    return match ?? null;
  }

  private async readJsonRecord<C extends CollectionName>(path: string) {
    const file = await this.readContentFile(path);

    if (!file || !file.content) {
      throw new DataLayerError("GITHUB_EMPTY_FILE", `GitHub file "${path}" is missing JSON content.`);
    }

    const decoded = Buffer.from(file.content, file.encoding === "base64" ? "base64" : "utf8").toString("utf8");

    return JSON.parse(decoded) as CollectionRecord<C>;
  }

  private async readContentFile(path: string, options?: { allowNotFound?: boolean }) {
    const config = this.getRuntimeConfig();
    const encodedPath = path
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    const cacheKey = `${this.getRepositoryCacheKey(config)}:content:${path}:allowNotFound:${Boolean(options?.allowNotFound)}`;

    return getCachedGitHubRead(contentFileCache, cacheKey, async () => {
      const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${encodedPath}?ref=${encodeURIComponent(
        config.branch,
      )}`;
      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${config.token}`,
        },
        cache: "no-store",
      });

      if (options?.allowNotFound && response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new DataLayerError(
          "GITHUB_CONTENT_READ_FAILED",
          `Failed to read "${path}" from GitHub: ${response.status} ${response.statusText}.`,
        );
      }

      return (await response.json()) as GitHubContentFile;
    });
  }

  private async listRepositoryTree() {
    const config = this.getRuntimeConfig();
    const cacheKey = `${this.getRepositoryCacheKey(config)}:tree`;

    return getCachedGitHubRead(repositoryTreeCache, cacheKey, async () => {
      const branchUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/branches/${encodeURIComponent(
        config.branch,
      )}`;
      const branchResponse = await fetch(branchUrl, {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${config.token}`,
        },
        cache: "no-store",
      });

      if (!branchResponse.ok) {
        throw new DataLayerError(
          "GITHUB_BRANCH_READ_FAILED",
          `Failed to resolve branch "${config.branch}" in ${config.owner}/${config.repo}.`,
        );
      }

      const branchPayload = (await branchResponse.json()) as GitHubBranchPayload;
      const treeSha = branchPayload.commit.commit.tree.sha;
      const treeUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/git/trees/${treeSha}?recursive=1`;
      const treeResponse = await fetch(treeUrl, {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${config.token}`,
        },
        cache: "no-store",
      });

      if (!treeResponse.ok) {
        throw new DataLayerError(
          "GITHUB_TREE_READ_FAILED",
          `Failed to read repository tree for ${config.owner}/${config.repo}:${config.branch}.`,
        );
      }

      const treePayload = (await treeResponse.json()) as { tree: GitHubTreeItem[] };

      return treePayload.tree;
    });
  }

  private async writeJsonRecord(path: string, record: unknown, options: { message: string; sha?: string | undefined }) {
    const config = this.getRuntimeConfig();
    const encodedPath = path
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    const body: {
      message: string;
      branch: string;
      content: string;
      sha?: string;
    } = {
      message: options.message,
      branch: config.branch,
      content: Buffer.from(`${JSON.stringify(record, null, 2)}\n`, "utf8").toString("base64"),
    };

    if (options.sha) {
      body.sha = options.sha;
    }

    const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/contents/${encodedPath}`, {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.status === 409 || response.status === 422) {
      throw new DataLayerError("GITHUB_WRITE_CONFLICT", `GitHub write conflict on "${path}".`);
    }

    if (!response.ok) {
      throw new DataLayerError(
        "GITHUB_WRITE_FAILED",
        `Failed to write "${path}" to GitHub: ${response.status} ${response.statusText}. ${getErrorMessage(
          await response.text(),
        )}`,
      );
    }

    this.clearRepositoryReadCache(config);
  }
}
