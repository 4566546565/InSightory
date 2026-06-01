import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const guide = await db.studyGuide.findFirst({ where: { category: "答题模板" } });
  if (!guide || !guide.content) { await db.$disconnect(); return; }
  const doc = guide.content as any;
  // Show nodes 5-15 to check list formatting
  for (let idx = 5; idx < Math.min(doc.content.length, 20); idx++) {
    const n = doc.content[idx];
    if (n.type === "heading") {
      const text = n.content?.map((c: any) => c.text || "").join("") || "";
      console.log(`${idx}: [h${n.attrs?.level}] ${text.substring(0, 70)}`);
    } else if (n.type === "orderedList") {
      for (const item of n.content || []) {
        const text = item.content?.[0]?.content?.map((c: any) => c.text || "").join("") || "";
        console.log(`${idx}:   ${text.substring(0, 70)}`);
      }
    } else if (n.type === "paragraph") {
      const text = n.content?.map((c: any) => c.text || "").join("") || "";
      console.log(`${idx}: para "${text.substring(0, 70)}"`);
    } else if (n.type === "blockquote") {
      const text = n.content?.[0]?.content?.map((c: any) => c.text || "").join("") || "";
      console.log(`${idx}: quote "${text.substring(0, 70)}"`);
    } else if (n.type === "horizontalRule") {
      console.log(`${idx}: ---`);
    } else {
      console.log(`${idx}: ${n.type}`);
    }
  }
  await db.$disconnect();
}
main();
