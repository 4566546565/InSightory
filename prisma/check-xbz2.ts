import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const textbook = await db.textbook.findFirst({
    where: { title: { contains: "选择性必修2" } },
  });
  if (!textbook) { console.error("未找到教材"); return; }

  console.log("=== 选择性必修2 数据检查 ===\n");

  const units = await db.unit.findMany({
    where: { textbookId: textbook.id },
    orderBy: { sortOrder: "asc" },
  });
  console.log(`单元数: ${units.length}`);
  for (const u of units) console.log(`  ${u.title}`);

  const lessons = await db.lesson.findMany({
    where: { unit: { textbookId: textbook.id } },
    orderBy: { lessonNumber: "asc" },
    include: { knowledgePoints: { orderBy: { sortOrder: "asc" } } },
  });

  console.log(`\n课程数: ${lessons.length}\n`);

  let totalKP = 0;
  for (const l of lessons) {
    const hasContent = l.content !== null && l.content !== undefined;
    const contentLen = hasContent ? JSON.stringify(l.content).length : 0;
    totalKP += l.knowledgePoints.length;

    console.log(`第${l.lessonNumber}课: ${l.title}`);
    console.log(`  课程内容: ${hasContent ? `有 (${contentLen} 字符)` : "空!"}`);
    console.log(`  知识点: ${l.knowledgePoints.length} 个`);
    for (const kp of l.knowledgePoints) {
      const kpContent = kp.content ? JSON.stringify(kp.content).length : 0;
      const hasMindMap = kp.mindMapJson !== null;
      console.log(`    - ${kp.title}: 内容${kpContent}字符, 思维导图${hasMindMap ? "有" : "无"}`);
    }
  }

  console.log(`\n总计: ${lessons.length} 门课程, ${totalKP} 个知识点`);
}

main().catch(console.error).finally(() => db.$disconnect());
