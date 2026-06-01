import { PrismaClient } from "@prisma/client";

async function main() {
  const db = new PrismaClient();
  try {
    const lessons = await db.lesson.findMany({
      where: { unit: { textbook: { title: { contains: "选择性必修1" } } } },
      orderBy: { lessonNumber: "asc" },
      select: {
        id: true,
        lessonNumber: true,
        title: true,
        content: true,
      },
    });

    console.log("课程内容检查：\n");
    for (const l of lessons) {
      const hasContent = l.content !== null && l.content !== undefined;
      const contentStr = hasContent ? JSON.stringify(l.content) : "";
      console.log(`第${l.lessonNumber}课: ${l.title}`);
      console.log(`  content: ${hasContent ? `有 (${contentStr.length} 字符)` : "空"}`);
    }

    // 也检查知识点内容
    console.log("\n\n知识点内容检查：\n");
    const kps = await db.knowledgePoint.findMany({
      where: { lesson: { unit: { textbook: { title: { contains: "选择性必修1" } } } } },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        content: true,
        lesson: { select: { lessonNumber: true, title: true } },
      },
    });

    for (const kp of kps) {
      const hasContent = kp.content !== null && kp.content !== undefined;
      const contentStr = hasContent ? JSON.stringify(kp.content) : "";
      console.log(`第${kp.lesson.lessonNumber}课 [${kp.title}]: ${hasContent ? `有 (${contentStr.length} 字符)` : "空"}`);
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch(console.error);
