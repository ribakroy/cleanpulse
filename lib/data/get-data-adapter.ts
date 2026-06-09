import type { DataAdapter } from "@/lib/data/adapter";
import { GitHubDataAdapter } from "@/lib/data/adapters/github-data-adapter";
import { LocalFileDataAdapter } from "@/lib/data/adapters/local-file-data-adapter";
import { env } from "@/lib/utils/env";

let cachedAdapter: DataAdapter | null = null;

export function getDataAdapter(): DataAdapter {
  if (!cachedAdapter) {
    cachedAdapter = env.dataAdapter === "github" ? new GitHubDataAdapter() : new LocalFileDataAdapter();
  }

  return cachedAdapter;
}

export function resetDataAdapterForTesting() {
  cachedAdapter = null;
}
