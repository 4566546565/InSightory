import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const textbook = await db.textbook.findFirst({
    where: { title: { contains: "选择性必修1" } },
  });
  if (!textbook) { console.log("未找到教材"); return; }

  const lessons = await db.lesson.findMany({
    where: { unit: { textbookId: textbook.id } },
    orderBy: { lessonNumber: "asc" },
  });

  for (const l of lessons) {
    const content = l.content as any;
    const paragraphs = content?.content?.length || 0;
    let totalChars = 0;
    if (content?.content) {
      for (const p of content.content) {
        for (const c of (p.content || [])) {
          totalChars += (c.text || "").length;
        }
      }
    }
    console.log(`第${String(l.lessonNumber).padStart(2, " ")}课 ${l.title}: ${paragraphs}段, 约${totalChars}字`);
  }
}

main().catch(console.error).finally(() => db.$disconnect());
