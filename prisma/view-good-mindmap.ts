import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  // 查找选择性必修1
  const textbook = await db.textbook.findFirst({
    where: { title: { contains: "选择性必修1" } },
  });
  if (!textbook) {
    console.log("未找到选择性必修1");
    return;
  }

  // 查找第1课（内容丰富的课程）
  const lesson = await db.lesson.findFirst({
    where: {
      unit: { textbookId: textbook.id },
      lessonNumber: 1,
    },
    include: {
      knowledgePoints: {
        orderBy: { sortOrder: "asc" },
        take: 1, // 只取第一个知识点
      },
    },
  });

  if (!lesson) {
    console.log("未找到第1课");
    return;
  }

  console.log(`课程: ${lesson.title}`);
  console.log(`知识点: ${lesson.knowledgePoints[0].title}`);
  console.log(`思维导图数据:`);
  console.log(JSON.stringify(lesson.knowledgePoints[0].mindMapJson, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());