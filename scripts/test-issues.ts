import { listIssueTypes } from "../lib/data/repositories/issue-types";

async function main() {
  try {
    const list = await listIssueTypes();
    console.log("LIST:", JSON.stringify(list, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
