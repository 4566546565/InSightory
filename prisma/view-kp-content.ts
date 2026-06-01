import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  // 查找中外历史纲要（上）
  const textbook = await db.textbook.findFirst({
    where: { title: { contains: "中外历史纲要（上）" } },
  });
  if (!textbook) {
    console.log("未找到中外历史纲要（上）");
    return;
  }

  // 查找第1课
  const lesson = await db.lesson.findFirst({
    where: {
      unit: { textbookId: textbook.id },
      lessonNumber: 1,
    },
    include: {
      knowledgePoints: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!lesson) {
    console.log("未找到第1课");
    return;
  }

  console.log(`课程: ${lesson.title}`);
  console.log(`知识点数量: ${lesson.knowledgePoints.length}`);

  for (const kp of lesson.knowledgePoints) {
    console.log(`\n知识点: ${kp.title}`);
    console.log(`思维导图: ${kp.mindMapJson ? '有' : '无'}`);
    if (kp.content) {
      console.log(`内容类型: ${kp.content.type}`);
      if (kp.content.content) {
        console.log(`内容段落数: ${kp.content.content.length}`);
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());