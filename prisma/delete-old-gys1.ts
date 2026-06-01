import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  // Delete the old one with "上册" in the title (not the new "（上）")
  const textbook = await db.textbook.findFirst({
    where: { title: { contains: "上册" } },
  });
  if (!textbook) { console.log("未找到旧教材"); return; }

  console.log(`找到旧教材: ${textbook.title} id=${textbook.id}`);

  const units = await db.unit.findMany({ where: { textbookId: textbook.id }, select: { id: true } });
  for (const u of units) {
    await db.knowledgePoint.deleteMany({ where: { lesson: { unitId: u.id } } });
    await db.lesson.deleteMany({ where: { unitId: u.id } });
  }
  await db.unit.deleteMany({ where: { textbookId: textbook.id } });
  await db.textbook.delete({ where: { id: textbook.id } });

  console.log("已删除旧教材及其所有单元、课程、知识点");
}

main().catch(console.error).finally(() => db.$disconnect());
