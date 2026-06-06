import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { scanKnowledgeExpansion } from "../src/lib/knowledge-expansion/scan";

const limit = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] ?? 80);
const output = process.argv.find((arg) => arg.startsWith("--out="))?.split("=")[1]
  ?? ".tmp/knowledge-expansion-candidates.json";

async function main() {
  const scan = await scanKnowledgeExpansion(limit);
  const outputPath = path.resolve(output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(scan, null, 2), "utf8");

  console.log(`generated ${scan.candidates.length} candidates from ${scan.scanned} knowledge points`);
  console.log(outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
