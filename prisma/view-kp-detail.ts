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

  // 查找第二个知识点（没有思维导图的）
  const kp = lesson.knowledgePoints[1];
  if (!kp) {
    console.log("未找到第二个知识点");
    return;
  }

  console.log(`知识点: ${kp.title}`);
  console.log(`思维导图: ${kp.mindMapJson ? '有' : '无'}`);
  console.log(`内容:`);
  console.log(JSON.stringify(kp.content, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());