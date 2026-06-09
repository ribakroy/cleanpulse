import { env } from "@/lib/utils/env";

export function getGitHubDataRepoConfig() {
  return {
    owner: env.githubDataOwner,
    repo: env.githubDataRepo,
    branch: env.githubDataBranch,
    token: env.githubDataToken,
  };
}
