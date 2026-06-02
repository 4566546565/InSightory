import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const guide = await db.studyGuide.findFirst({ where: { category: "答题模板" } });
  if (!guide || !guide.content) { await db.$disconnect(); return; }
  const doc = guide.content as any;
  // Show nodes 10-25 to check list structure
  for (let idx = 10; idx < Math.min(doc.content.length, 25); idx++) {
    const n = doc.content[idx];
    if (n.type === "heading") {
      const text = n.content?.map((c: any) => c.text || "").join("") || "";
      console.log(`${idx}: [h${n.attrs?.level}] "${text.substring(0, 80)}"`);
    } else if (n.type === "orderedList") {
      console.log(`${idx}: [ol] (${n.content?.length} items)`);
      for (let j = 0; j < (n.content?.length || 0); j++) {
        const item = n.content[j];
        const text = item.content?.[0]?.content?.map((c: any) => c.text || "").join("") || "";
        console.log(`     ${j+1}. "${text.substring(0, 80)}"`);
      }
    } else if (n.type === "paragraph") {
      const text = n.content?.map((c: any) => c.text || "").join("") || "";
      console.log(`${idx}: para "${text.substring(0, 80)}"`);
    } else if (n.type === "blockquote") {
      const text = n.content?.[0]?.content?.map((c: any) => c.text || "").join("") || "";
      console.log(`${idx}: quote "${text.substring(0, 80)}"`);
    } else if (n.type === "horizontalRule") {
      console.log(`${idx}: ---`);
    } else if (n.type === "bulletList") {
      console.log(`${idx}: [ul] (${n.content?.length} items)`);
      for (let j = 0; j < (n.content?.length || 0); j++) {
        const item = n.content[j];
        const text = item.content?.[0]?.content?.map((c: any) => c.text || "").join("") || "";
        console.log(`     - "${text.substring(0, 80)}"`);
      }
    } else {
      console.log(`${idx}: ${n.type}`);
    }
  }
  await db.$disconnect();
}
main();
