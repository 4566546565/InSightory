import { readFile } from "node:fs/promises";
import path from "node:path";
import type { KnowledgeExpansionCandidate } from "../src/lib/knowledge-expansion/types";
import { applyApprovedCandidate, persistCandidate, updateCandidateStatus } from "../src/lib/knowledge-expansion/persistence";
import { db } from "../src/lib/db";

const input = process.argv.find((arg) => arg.startsWith("--in="))?.split("=")[1]
  ?? ".tmp/knowledge-expansion-candidates.json";

async function main() {
  const payload = JSON.parse(await readFile(path.resolve(input), "utf8")) as {
    candidates?: KnowledgeExpansionCandidate[];
  };

  const approved = (payload.candidates ?? []).filter((candidate) => candidate.status === "approved");
  let applied = 0;

  for (const candidate of approved) {
    await persistCandidate(candidate);
    await updateCandidateStatus(candidate.id, "approved");
    await applyApprovedCandidate(candidate.id);
    applied += 1;
  }

  await db.$disconnect();
  console.log(`applied ${applied} approved candidates`);
}

main().catch(async (error) => {
  await db.$disconnect();
  console.error(error);
  process.exit(1);
});
