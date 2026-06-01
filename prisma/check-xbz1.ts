import { PrismaClient } from "@prisma/client";

async function main() {
  const db = new PrismaClient();
  try {
    // 检查教材
    const textbook = await db.textbook.findFirst({
      where: { title: { contains: "选择性必修1" } },
    });
    console.log("教材:", textbook ? `${textbook.title} (ID: ${textbook.id})` : "未找到");

    if (!textbook) return;

    // 检查单元
    const units = await db.unit.findMany({
      where: { textbookId: textbook.id },
      orderBy: { sortOrder: "asc" },
    });
    console.log("\n单元数:", units.length);
    for (const u of units) {
      console.log(`  - ${u.title}`);
    }

    // 检查课程
    const lessons = await db.lesson.findMany({
      where: { unit: { textbookId: textbook.id } },
      orderBy: { lessonNumber: "asc" },
      include: { knowledgePoints: true },
    });
    console.log("\n课程数:", lessons.length);
    for (const l of lessons) {
      console.log(`  第${l.lessonNumber}课: ${l.title} (${l.knowledgePoints.length} 个知识点)`);
      for (const kp of l.knowledgePoints) {
        const contentStr = JSON.stringify(kp.content);
        const hasContent = contentStr.length > 50;
        console.log(`    - ${kp.title}: ${hasContent ? "有内容 (" + contentStr.length + " 字符)" : "空内容"}`);
      }
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch(console.error);
