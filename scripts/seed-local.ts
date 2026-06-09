import { readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { LocalFileDataAdapter } from "../lib/data/adapters/local-file-data-adapter";
import {
  demoActivityLogs,
  demoBranch,
  demoIncidents,
  demoIssueTypes,
  demoNotificationRecipient,
  demoOrganization,
  demoOwnerUser,
  demoRestroom,
  demoScreen,
} from "../data-seed/demo-data";

async function hasExistingFiles(rootPath: string) {
  try {
    const entries = await readdir(rootPath);
    return entries.length > 0;
  } catch {
    return false;
  }
}

async function main() {
  const force = process.argv.includes("--force");
  const rootPath = resolve(process.cwd(), "data-local");

  if (!force && (await hasExistingFiles(rootPath))) {
    throw new Error('data-local כבר מכיל דאטה. להרצה חוזרת יש להשתמש ב־"--force".');
  }

  if (force) {
    await rm(rootPath, { recursive: true, force: true });
  }

  const adapter = new LocalFileDataAdapter();

  await adapter.create("organizations", demoOrganization);
  await adapter.create("users", demoOwnerUser);
  await adapter.create("branches", demoBranch);
  await adapter.create("restrooms", demoRestroom);
  await adapter.create("screens", demoScreen);

  for (const issueType of demoIssueTypes) {
    await adapter.create("issue_types", issueType);
  }

  await adapter.create("notification_recipients", demoNotificationRecipient);

  for (const incident of demoIncidents) {
    await adapter.create("incidents", incident);
  }

  for (const activityLog of demoActivityLogs) {
    await adapter.appendLog("activity_logs", activityLog);
  }

  console.log("Local seed completed successfully.");
  console.log(`Root: ${rootPath}`);
  console.log(`Organizations: 1`);
  console.log(`Users: 1`);
  console.log(`Branches: 1`);
  console.log(`Restrooms: 1`);
  console.log(`Screens: 1`);
  console.log(`Issue types: ${demoIssueTypes.length}`);
  console.log(`Notification recipients: 1`);
  console.log(`Incidents: ${demoIncidents.length}`);
  console.log(`Activity logs: ${demoActivityLogs.length}`);
}

main().catch((error) => {
  console.error("Local seed failed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
