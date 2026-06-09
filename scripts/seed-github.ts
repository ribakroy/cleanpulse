import { GitHubDataAdapter } from "../lib/data/adapters/github-data-adapter";
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
import type { CollectionName, CollectionRecord } from "../lib/data/types";

function toUpdatePatch<C extends CollectionName>(record: CollectionRecord<C>) {
  const { id: _id, createdAt: _createdAt, ...patch } = record as CollectionRecord<C> & {
    createdAt?: string;
  };

  void _id;
  void _createdAt;

  return patch;
}

async function upsertRecord<C extends CollectionName>(
  adapter: GitHubDataAdapter,
  collection: C,
  record: CollectionRecord<C>,
  force: boolean,
) {
  const existingRecord = await adapter.get(collection, record.id);

  if (existingRecord && !force) {
    throw new Error(`Record "${record.id}" already exists in "${collection}". Re-run with --force to overwrite.`);
  }

  if (existingRecord) {
    return adapter.update(collection, record.id, toUpdatePatch(record));
  }

  return adapter.create(collection, record);
}

async function main() {
  const force = process.argv.includes("--force");
  const adapter = new GitHubDataAdapter();

  await upsertRecord(adapter, "organizations", demoOrganization, force);
  await upsertRecord(adapter, "users", demoOwnerUser, force);
  await upsertRecord(adapter, "branches", demoBranch, force);
  await upsertRecord(adapter, "restrooms", demoRestroom, force);
  await upsertRecord(adapter, "screens", demoScreen, force);

  for (const issueType of demoIssueTypes) {
    await upsertRecord(adapter, "issue_types", issueType, force);
  }

  await upsertRecord(adapter, "notification_recipients", demoNotificationRecipient, force);

  for (const incident of demoIncidents) {
    await upsertRecord(adapter, "incidents", incident, force);
  }

  for (const activityLog of demoActivityLogs) {
    await upsertRecord(adapter, "activity_logs", activityLog, force);
  }

  console.log("GitHub seed completed successfully.");
  console.log(`Repository: ${adapter.describe().repository}`);
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
  console.error("GitHub seed failed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
