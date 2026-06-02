import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const textbook = await db.textbook.findFirst({
    where: { title: { contains: "下册" } },
  });
  if (!textbook) { console.log("未找到教材"); return; }

  console.log(`找到教材: ${textbook.title} id=${textbook.id}`);

  const units = await db.unit.findMany({ where: { textbookId: textbook.id }, select: { id: true } });
  for (const u of units) {
    await db.knowledgePoint.deleteMany({ where: { lesson: { unitId: u.id } } });
    await db.lesson.deleteMany({ where: { unitId: u.id } });
  }
  await db.unit.deleteMany({ where: { textbookId: textbook.id } });
  await db.textbook.delete({ where: { id: textbook.id } });

  console.log("已删除：中外历史纲要 下册 及其所有单元、课程、知识点");
}

main().catch(console.error).finally(() => db.$disconnect());
