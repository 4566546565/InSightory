import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const guide = await db.studyGuide.findFirst({ where: { category: "考试策略" } });
  if (!guide || !guide.content) { await db.$disconnect(); return; }
  const doc = guide.content as any;
  for (const n of doc.content) {
    if (n.type === "heading") {
      const text = n.content?.map((c: any) => c.text || "").join("") || "";
      console.log(`[h${n.attrs?.level}] ${text.substring(0, 80)}`);
    } else if (n.type === "orderedList") {
      for (const item of n.content || []) {
        const text = item.content?.[0]?.content?.map((c: any) => c.text || "").join("") || "";
        console.log(`  ${text.substring(0, 80)}`);
      }
    } else if (n.type === "paragraph") {
      const text = n.content?.map((c: any) => c.text || "").join("") || "";
      console.log(`para: ${text.substring(0, 100)}`);
    } else if (n.type === "horizontalRule") {
      console.log("---");
    } else {
      console.log(n.type);
    }
  }
  await db.$disconnect();
}
main();
