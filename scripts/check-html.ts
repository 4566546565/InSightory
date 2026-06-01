import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const guide = await db.studyGuide.findFirst({ where: { category: "答题模板" } });
  if (!guide || !guide.content) { await db.$disconnect(); return; }
  const doc = guide.content as any;
  // Check the first orderedList in detail
  for (let idx = 0; idx < doc.content.length; idx++) {
    const n = doc.content[idx];
    if (n.type === "orderedList") {
      console.log(`idx ${idx}: orderedList with ${n.content?.length} items`);
      console.log(`  Full node: ${JSON.stringify(n).substring(0, 500)}`);
      break;
    }
  }
  // Also check total node types
  const types: Record<string, number> = {};
  for (const n of doc.content) {
    types[n.type] = (types[n.type] || 0) + 1;
  }
  console.log("\nNode types:", types);
  await db.$disconnect();
}
main();
