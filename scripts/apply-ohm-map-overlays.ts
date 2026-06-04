import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { upsertCandidateMapOverlays } from "../src/lib/knowledge-expansion/map-overlays";
import type { KnowledgeExpansionCandidate } from "../src/lib/knowledge-expansion/types";

const db = new PrismaClient();
const input = process.argv.find((arg) => arg.startsWith("--in="))?.split("=")[1]
  ?? ".tmp/knowledge-expansion-candidates.json";

async function main() {
  const payload = JSON.parse(await readFile(path.resolve(input), "utf8")) as {
    candidates?: KnowledgeExpansionCandidate[];
  };
  const candidates = payload.candidates ?? [];
  let written = 0;

  for (const candidate of candidates) {
    const result = await upsertCandidateMapOverlays(candidate.title, candidate.mapOverlays);
    if (result) written += 1;
  }

  await db.$disconnect();
  console.log(`wrote ${written} OHM overlay candidate groups`);
}

main().catch(async (error) => {
  await db.$disconnect();
  console.error(error);
  process.exit(1);
});
