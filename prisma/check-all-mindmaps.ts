import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const textbooks = await db.textbook.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      units: {
        orderBy: { unitNumber: "asc" },
        include: {
          lessons: {
            orderBy: { lessonNumber: "asc" },
            include: {
              knowledgePoints: {
                select: { id: true, title: true, mindMapJson: true },
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      },
    },
  });

  console.log("=== 思维导图检查报告 ===\n");

  let totalLessons = 0;
  let lessonsWithMindMap = 0;
  let lessonsWithoutMindMap = 0;

  for (const textbook of textbooks) {
    console.log(`\n教材: ${textbook.title} (${textbook.volume})`);
    console.log(`${"=".repeat(60)}`);

    for (const unit of textbook.units) {
      for (const lesson of unit.lessons) {
        totalLessons++;
        const kpsWithMindMap = lesson.knowledgePoints.filter(
          (kp) => kp.mindMapJson !== null
        );
        const kpsWithoutMindMap = lesson.knowledgePoints.filter(
          (kp) => kp.mindMapJson === null
        );

        if (kpsWithMindMap.length > 0) {
          lessonsWithMindMap++;
          console.log(`✓ 第${lesson.lessonNumber}课: ${lesson.title} (有思维导图)`);
        } else {
          lessonsWithoutMindMap++;
          console.log(`✗ 第${lesson.lessonNumber}课: ${lesson.title} (无思维导图)`);
        }
      }
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`总计: ${totalLessons} 课`);
  console.log(`有思维导图: ${lessonsWithMindMap} 课`);
  console.log(`无思维导图: ${lessonsWithoutMindMap} 课`);
  console.log(`完成率: ${((lessonsWithMindMap / totalLessons) * 100).toFixed(1)}%`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());