import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const guide = await db.studyGuide.findFirst({ where: { category: "答题模板" } });
  if (!guide || !guide.content) { await db.$disconnect(); return; }
  const doc = guide.content as any;
  // Show all headings with their level and index
  for (let idx = 0; idx < doc.content.length; idx++) {
    const n = doc.content[idx];
    if (n.type === "heading") {
      const text = n.content?.map((c: any) => c.text || "").join("") || "";
      console.log(`${idx}: [h${n.attrs?.level}] ${text}`);
    }
  }
  await db.$disconnect();
}
main();
