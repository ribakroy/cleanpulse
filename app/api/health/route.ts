import { NextResponse } from "next/server";
import { env } from "@/lib/utils/env";

export async function GET() {
  let githubRepoReachable: boolean | null = null;
  let errorDetail: string | null = null;

  if (env.dataAdapter === "github") {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second connection timeout

      const url = `https://api.github.com/repos/${env.githubDataOwner}/${env.githubDataRepo}`;
      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${env.githubDataToken}`,
        },
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        githubRepoReachable = true;
      } else {
        githubRepoReachable = false;
        errorDetail = `GitHub API returned status ${response.status}`;
      }
    } catch (error) {
      githubRepoReachable = false;
      errorDetail = error instanceof Error ? error.message : "Connection failed";
    }
  }

  const isHealthy = githubRepoReachable !== false;

  const responseBody: Record<string, unknown> = {
    status: isHealthy ? "ok" : "error",
    app: "cleanpulse",
    environment: process.env.NODE_ENV || "development",
    dataAdapter: env.dataAdapter,
    dataRepository: env.dataAdapter === "github" ? `${env.githubDataOwner}/${env.githubDataRepo}` : "local-file-db",
    emailProvider: env.emailProvider,
    timestamp: new Date().toISOString(),
  };

  if (githubRepoReachable !== null) {
    responseBody.githubRepoReachable = githubRepoReachable;
    if (!isHealthy) {
      responseBody.message = "Database repository is not reachable or unauthorized.";
      // Debug info is only shown in development/testing mode to prevent info leak
      if (process.env.NODE_ENV !== "production") {
        responseBody.debug = errorDetail;
      }
    }
  }

  return NextResponse.json(responseBody, {
    status: isHealthy ? 200 : 503,
    headers: {
      "cache-control": "no-store",
    },
  });
}
