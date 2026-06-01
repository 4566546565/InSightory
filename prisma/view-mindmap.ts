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

  // 查找第16课
  const lesson = await db.lesson.findFirst({
    where: {
      unit: { textbookId: textbook.id },
      lessonNumber: 16,
    },
    include: {
      knowledgePoints: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!lesson) {
    console.log("未找到第16课");
    return;
  }

  console.log(`课程: ${lesson.title}`);
  console.log(`知识点数量: ${lesson.knowledgePoints.length}`);

  for (const kp of lesson.knowledgePoints) {
    console.log(`\n知识点: ${kp.title}`);
    console.log(`思维导图数据:`);
    console.log(JSON.stringify(kp.mindMapJson, null, 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());