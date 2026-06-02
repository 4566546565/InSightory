import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const guide = await db.studyGuide.findFirst({ where: { category: "答题模板" } });
  if (!guide || !guide.content) { await db.$disconnect(); return; }
  const doc = guide.content as any;
  // Find the first orderedList and show its structure
  for (let idx = 0; idx < doc.content.length; idx++) {
    const n = doc.content[idx];
    if (n.type === "orderedList") {
      console.log(`=== orderedList at idx ${idx}, ${n.content?.length} items ===`);
      for (let j = 0; j < Math.min(n.content?.length || 0, 6); j++) {
        const item = n.content[j];
        const text = item.content?.[0]?.content?.map((c: any) => c.text || "").join("") || "";
        console.log(`  [${j}] type=${item.type}, text="${text.substring(0, 60)}"`);
      }
      if (idx > 20) break; // only show first few
    }
  }
  await db.$disconnect();
}
main();
